import { VRM, VRMUtils } from '@pixiv/three-vrm';
import * as THREE from 'three';

import useAgentStore from '@/store/useAgentStore';
import useVRMStore, { AnimationOptions } from '@/store/vrmStore';
import { AnimationStates } from '@/types/agent';

import { EmoteController } from './emoteController/emoteController';
import { LipSync } from './lipSync/lipSync';
import { Screenplay } from './messages/messages';
import { VRMAnimation } from './VRMAnimation/VRMAnimation';

/**
 * The Model class wraps a VRM instance plus Audio + Anim mixers + cross-fade logic.
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public emoteController?: EmoteController;
  public isSpeaking: boolean = false;
  public onSpeechEnd?: () => void;
  public isLoaded: boolean = false;

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;
  private _audioContext?: AudioContext;
  private _gainNode?: GainNode;
  private _mixer?: THREE.AnimationMixer;
  private _clock: THREE.Clock;

  public idleAnimation?: THREE.AnimationAction;
  public actionAnimation?: THREE.AnimationAction;

  private idleTransitionTimeout?: ReturnType<typeof setTimeout>;
  private actionTransitionTimeout?: ReturnType<typeof setTimeout>;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
  }

  private initAudioContextIfNeeded() {
    if (!this._audioContext) {
      this._audioContext = new AudioContext();
      this._gainNode = this._audioContext.createGain();
      this._gainNode.connect(this._audioContext.destination);
      this._lipSync = new LipSync(this._audioContext, this._gainNode);
    }
    if (this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
      this.isLoaded = false;
    }
  }

  /**
   * Called every frame from your R3F's useFrame to update lips, expressions, etc.
   */
  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync('aa', volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }

  /**
   * For IDLE animations
   */
  public async loadIdleAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    console.log('[Model] loadIdleAnimation called...');
    if (!this.vrm || !this.mixer) {
      console.warn(
        '[Model] VRM or mixer not ready, cannot load idle animation'
      );
      return;
    }

    const clip = vrmAnimation.createAnimationClip(this.vrm);

    const newIdleAction = this.mixer.clipAction(clip);
    newIdleAction.loop = THREE.LoopRepeat;
    newIdleAction.enabled = true;
    newIdleAction.play();

    // Cross-fade from existing idle
    if (this.idleAnimation && this.idleAnimation !== newIdleAction) {
      this.idleAnimation.crossFadeTo(newIdleAction, 0.5, false);

      if (this.idleTransitionTimeout) clearTimeout(this.idleTransitionTimeout);
      const oldIdle = this.idleAnimation;

      this.idleTransitionTimeout = setTimeout(() => {
        oldIdle.stop();
        this.mixer?.uncacheAction(oldIdle.getClip());
      }, 500);

      this.idleAnimation = newIdleAction;
    } else {
      // no prior idle
      newIdleAction.weight = 1.0;
      this.idleAnimation = newIdleAction;
    }
  }

  /**
   * For "TALK" or other "action" animations
   */
  public async playActionAnimation(
    vrmAnimation: VRMAnimation,
    options?: AnimationOptions
  ) {
    console.log('[Model] playActionAnimation called...');
    if (!this.vrm || !this.mixer) {
      console.warn(
        '[Model] VRM or mixer not ready, cannot play action animation'
      );
      return;
    }
    const clip = vrmAnimation.createAnimationClip(this.vrm);

    // fade out existing action if any
    if (this.actionAnimation) {
      this.actionAnimation.fadeOut(0.2);
      if (this.actionTransitionTimeout)
        clearTimeout(this.actionTransitionTimeout);

      const previousAction = this.actionAnimation;
      this.actionTransitionTimeout = setTimeout(() => {
        previousAction.stop();
        this.mixer?.uncacheAction(previousAction.getClip());
      }, 200);

      this.actionAnimation = undefined;
    }

    const action = this.mixer.clipAction(clip);
    action.loop = options?.loop ? THREE.LoopRepeat : THREE.LoopOnce;
    action.clampWhenFinished = !options?.loop;
    action.enabled = true;
    action.play();

    if (this.idleAnimation) {
      // cross-fade from idle
      this.idleAnimation.crossFadeTo(action, 0.5, false);
    }
    this.actionAnimation = action;

    if (!options?.loop) {
      // Once the animation finishes, revert to idle if present
      const onFinished = (
        event: THREE.Event & { action: THREE.AnimationAction }
      ) => {
        if (event.action === this.actionAnimation) {
          this.mixer?.removeEventListener('finished', onFinished);
          this.stopActionAnimation();
        }
      };
      this.mixer.addEventListener('finished', onFinished);
    }
  }

  /**
   * Revert to idle after finishing action animation
   */
  public stopActionAnimation() {
    if (!this.actionAnimation) return;

    this.actionAnimation.fadeOut(0.5);
    if (this.actionTransitionTimeout)
      clearTimeout(this.actionTransitionTimeout);
    const oldAction = this.actionAnimation;

    this.actionTransitionTimeout = setTimeout(() => {
      oldAction.stop();
      this.mixer?.uncacheAction(oldAction.getClip());
    }, 500);

    if (this.idleAnimation) {
      // cross-fade back to idle
      this.idleAnimation.reset().fadeIn(0.5).play();
    }
    this.actionAnimation = undefined;
  }

  /**
   * Basic TTS from array buffer => plays talk animation if talkAnimationId or if agent has a "TALK" animation
   */
  public async speakFromBuffer(
    audio: ArrayBuffer,
    text?: string,
    talkAnimationId?: number
  ) {
    if (this.isSpeaking) {
      console.log('[Model] Already speaking, ignoring new speech');
      return;
    }
    this.isSpeaking = true;

    if (talkAnimationId == null) {
      const { selectedAgent, allAgents } = useAgentStore.getState();
      const foundAgent = allAgents.find((a) => a.id === selectedAgent);
      if (foundAgent && foundAgent.animations) {
        const talkEntry = foundAgent.animations.find(
          (anim) => anim.state === AnimationStates.TALK
        );

        if (talkEntry?.animationId) {
          talkAnimationId = talkEntry.animationId;
        }
      }
    }

    try {
      this.initAudioContextIfNeeded();

      // If we have a talkAnimationId, load & play that
      if (talkAnimationId) {
        useVRMStore
          .getState()
          .playActionAnimationById(talkAnimationId, { loop: true });
      }

      await new Promise<void>((resolve) => {
        if (this._lipSync) {
          this._lipSync.playFromArrayBuffer(audio, () => {
            // Done => revert
            this.stopActionAnimation();
            this.isSpeaking = false;
            if (this.onSpeechEnd) this.onSpeechEnd();
            resolve();
          });
        }
      });
    } catch (error) {
      console.error('[Model] speakFromBuffer error:', error);
      this.isSpeaking = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
    }
  }

  /**
   * Generic "speak" with optional screenplay and a known action animation ID
   */
  public async speak({
    buffer,
    screenplay,
    actionAnimationId,
    options,
  }: {
    buffer: ArrayBuffer;
    screenplay: Screenplay | null;
    actionAnimationId?: number;
    options?: AnimationOptions;
  }) {
    if (screenplay) {
      // e.g. expression changes
      this.emoteController?.playEmotion(screenplay.expression);
    }
    if (actionAnimationId) {
      useVRMStore
        .getState()
        .playActionAnimationById(actionAnimationId, options);
    }
    await new Promise<void>((resolve) => {
      this._lipSync?.playFromArrayBuffer(buffer, () => {
        this.stopActionAnimation();
        resolve();
      });
    });
  }

  public cancelSpeech() {
    if (this.isSpeaking) {
      this._lipSync?.stop();
      this.stopActionAnimation();
      this.isSpeaking = false;
      this.onSpeechEnd?.();
    }
  }

  // Add volume control methods
  public setVolume(volume: number) {
    this.initAudioContextIfNeeded();
    if (this._gainNode) {
      console.log(`Setting volume to: ${volume}`);
      this._gainNode.gain.value = Math.max(0, Math.min(1, volume));
    } else {
      console.warn('No gain node available to set volume');
    }
  }

  public getVolume(): number {
    return this._gainNode?.gain.value ?? 1;
  }
}
