// import { VRM } from '@pixiv/three-vrm';
// import { useState, useEffect, useCallback } from 'react';
// import { ToggleSwitch } from '../ui-components/ToggleSwitch';
// import { useToolTip } from '../ui-components/ToolTip/ToolTipContextProvider';
// import { useVRMContext } from './VRMContextProvider';
// import * as THREE from 'three';
// import { useIsMobile } from '../utility/useIsMobile';
// import { useDialog } from '@/components/providers/dialog.provider';
// import { Button } from '../ui/button';
// import { IVrmProps } from '../types/dbtypes';

// /**
//  * Renders the VRM configuration window.
//  *
//  * @param selectedVrm - The selected VRM props.
//  * @param currentVrm - The current VRM instance.
//  */
// export function VrmConfigWindow({ currentVrm }: { currentVrm: VRM | null }) {
//   // const [expressionScale, setExpressionScale] = useState<
//   //   VRMConfig["expressionWeights"]
//   // >({});

//   const { showDialog } = useDialog();
//   const { showToolTip } = useToolTip();

//   const [, setExpressionValues] = useState({});
//   const { vrms, selectedVRM, setSelectedVRM, updateVRMs } = useVRMContext();

//   const { isMobile } = useIsMobile();

//   /**
//    * React hook that updates expression values for a VRM model.
//    *
//    * This hook sets up an animation loop to continuously update the expression values of a VRM model.
//    * It retrieves the current expression values from the expression manager of the VRM model and updates
//    * the state with the new values. The animation loop is canceled when the component unmounts.
//    *
//    * @param currentVrm - The current VRM model.
//    * @param expressionScale - The scale of the expression values.
//    */
//   useEffect(() => {
//     let animationFrameId: number = 0;

//     const updateExpressionValues = () => {
//       const newValues: { [key: string]: string } = {};
//       if (currentVrm && currentVrm.expressionManager && selectedVRM.vrmConfig) {
//         for (const key in selectedVRM.vrmConfig.expressionWeights) {
//           const value = currentVrm.expressionManager.getValue(key);
//           newValues[key] = value?.toFixed(2) || '';
//         }
//         setExpressionValues(newValues);
//       }
//       animationFrameId = requestAnimationFrame(updateExpressionValues);
//     };

//     updateExpressionValues();

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, [currentVrm, selectedVRM.vrmConfig?.expressionWeights]);

//   /**
//    * useEffect hook that sets the initial expression weights for the current VRM model.
//    * It retrieves the expression map from the expression manager of the VRM model and assigns a weight of 1 to each expression.
//    * @param {VRM | null} currentVrm - The current VRM model.
//    */
//   useEffect(() => {
//     if (currentVrm && currentVrm.expressionManager) {
//       const initialWeights = {};

//       // to access private property
//       const expressionMap = currentVrm.expressionManager['_expressionMap'];

//       for (const key in expressionMap) {
//         initialWeights[key] = selectedVRM.vrmConfig?.expressionWeights
//           ? selectedVRM.vrmConfig.expressionWeights[key]
//           : 1;
//       }

//       setSelectedVRM({
//         ...selectedVRM,
//         vrmConfig: { expressionWeights: initialWeights },
//       });
//     }
//   }, [currentVrm]);

//   /**
//    * Handles the change event of the slider.
//    * @param {string} key - The key of the expression scale.
//    * @param {number} value - The new value of the expression scale.
//    */
//   const handleSliderChange = useCallback(
//     (key: string, value: number) => {
//       if (selectedVRM) {
//         const updatedVRM = {
//           ...selectedVRM,
//           vrmConfig: {
//             expressionWeights: {
//               ...selectedVRM.vrmConfig?.expressionWeights,
//               [key]: value,
//             },
//           },
//         };

//         const vrmIndex = vrms.findIndex((vrm) => vrm.name === selectedVRM.name);
//         if (vrmIndex !== -1) {
//           vrms[vrmIndex] = updatedVRM;
//         }
//         updateVRMs(vrms);
//         setSelectedVRM(updatedVRM);
//       }
//     },
//     [selectedVRM, updateVRMs, vrms]
//   );

//   /**
//    * Saves the configuration of the selected VRM model to the clipboard.
//    * If a VRM model is selected, it extracts the URL and rotation properties,
//    * and copies the rest of the VRM object to the clipboard as a JSON string.
//    */
//   const saveConfigToClipboard = () => {
//     if (selectedVRM) {
//       // eslint-disable-next-line
//       const { url, ...restOfVrm } = selectedVRM;

//       const textToCopy = JSON.stringify(restOfVrm, null, 2);

//       navigator.clipboard.writeText(textToCopy);
//     }
//   };

//   /**
//    * Loads the VRM configuration from a JSON file.
//    */
//   const loadConfig = () => {
//     const handleLoadConfig = () => {
//       try {
//         const textarea = document.getElementById(
//           'json-config-textarea'
//         ) as HTMLTextAreaElement;
//         const textValue = textarea ? textarea.value : '';

//         const vrmConfig = JSON.parse(textValue);

//         const updatedVrm: IVrmProps = { ...selectedVRM };
//         Object.keys(vrmConfig).forEach((key) => {
//           if (
//             key !== 'name' &&
//             Object.prototype.hasOwnProperty.call(updatedVrm, key)
//           ) {
//             updatedVrm[key] = vrmConfig[key];
//           }
//         });

//         // TODO: update this so that vrm config contains offset, position etc and name remains part of IVrmProps so that user cannot overwrite name

//         const vrmIndex = vrms.findIndex((vrm) => vrm.name === selectedVRM.name);
//         if (vrmIndex !== -1) {
//           vrms[vrmIndex] = updatedVrm;
//         }
//         updateVRMs(vrms);
//         setSelectedVRM(updatedVrm as IVrmProps);

//         console.log('updatedVrm:', vrms[vrmIndex]);
//       } catch (error) {
//         console.error('Error loading config:', error);
//         showDialog({
//           title: 'Error',

//           closeButton: {
//             visible: false,
//           },
//           size: 'md',
//           variant: 'glass',
//           content: 'Failed to parse the pasted content.',
//           type: 'error',
//         });
//       }
//     };

//     showToolTip({
//       title: 'Paste JSON Config File',
//       content: (
//         <textarea
//           className="w-full h-32 p-2 border border-gray-300 rounded text-black"
//           placeholder="Paste your JSON config here"
//           id="json-config-textarea"
//         />
//       ),
//       buttons: [
//         {
//           label: 'Cancel',
//           onClick: () => {}, // Implement the logic to close/hide the tooltip
//         },
//         {
//           label: 'Load JSON',
//           onClick: handleLoadConfig,
//         },
//       ],
//       refElement: null,
//       options: {
//         placement: 'top',
//         clickBgClose: false,
//       },
//     });
//   };

//   return (
//     <div className="w-full h-screen flex flex-col justify-center items-end ">
//       <div className="w-1/2 sm:w-1/3 h-full overflow-hidden flex flex-col p-4 bg-black/10 backdrop-blur-md rounded-lg text-white gap-4 ">
//         <div className={'flex flex-col h-fit px-4 gap-2'}>
//           <div className={'text-xl'}>{selectedVRM.name}</div>
//           <ToggleSwitch
//             labelEnabled="Blendshapes uppercase"
//             labelDisabled="Blendshapes lowercase"
//             value={selectedVRM.vrmConfig?.blendshapesUpperCase}
//             onChange={(value) => {
//               setSelectedVRM({
//                 ...selectedVRM,
//                 vrmConfig: {
//                   ...selectedVRM.vrmConfig,
//                   blendshapesUpperCase: value,
//                 },
//               });
//             }}
//             className={`${
//               isMobile ? 'flex-col items-start gap-2' : 'flex-row'
//             }`}
//           />
//           <div
//             className={`flex ${
//               isMobile ? 'flex-col w-full items-start' : 'flex-row items-center'
//             } gap-2`}>
//             <div>Y Offset</div>
//             <div>{selectedVRM.vrmConfig?.offset[1]?.toFixed(2)}</div>
//             <input
//               type="range"
//               min={-1}
//               max={1}
//               step={0.025}
//               className={`slider ${
//                 isMobile ? 'w-full' : 'w-1/2'
//               } h-2 rounded-lg cursor-pointer`}
//               value={selectedVRM.vrmConfig?.offset[1]}
//               onChange={(event) => {
//                 const val = Number(event.target.value);
//                 setSelectedVRM({
//                   ...selectedVRM,
//                   vrmConfig: {
//                     ...selectedVRM.vrmConfig,
//                     offset: [
//                       selectedVRM.vrmConfig?.offset[0],
//                       val,
//                       selectedVRM.vrmConfig?.offset[2],
//                     ],
//                   },
//                 });
//               }}
//             />
//           </div>
//         </div>
//         <div
//           className={'flex flex-col h-auto overflow-y-auto overflow-x-hidden'}>
//           {Object.entries(selectedVRM.vrmConfig?.expressionWeights || {}).map(
//             ([key, value]) => (
//               <div className={'flex flex-col w-full px-4'} key={key}>
//                 <div className={'flex flex-row justify-between'}>
//                   <div>{key}</div>
//                 </div>
//                 <div className={'flex flex-row w-full justify-between'}>
//                   <div>
//                     {currentVrm?.expressionManager?.getValue(key)?.toFixed(2) ||
//                       ''}
//                   </div>
//                   <div>{value}</div>
//                 </div>
//                 <div className={''}>
//                   <input
//                     type="range"
//                     min={-2.0}
//                     max={2.0}
//                     step={0.1}
//                     className="slider w-full h-2 rounded-lg cursor-pointer"
//                     value={value}
//                     onChange={(event) =>
//                       handleSliderChange(key, Number(event.target.value))
//                     }
//                   />
//                 </div>
//               </div>
//             )
//           )}
//         </div>
//         <div className={'flex flex-row flex-wrap'}>
//           <Button variant="primary" size="sm" onClick={saveConfigToClipboard}>
//             Save to clipboard
//           </Button>
//           <Button variant="primary" size="sm" onClick={loadConfig}>
//             Load JSON
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
