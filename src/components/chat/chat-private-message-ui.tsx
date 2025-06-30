import { cn } from '@/lib/utils';
import { Message } from '@/store/useSocketChatStore';

export function ChatPrivateMessageUI({ msg }: { msg: Message }) {
  const isUser = msg.isUser;

  return (
    <div
      key={msg.id}
      className={cn(
        'my-1 flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}>
      <div
        className={cn(
          'flex items-start gap-x-2.5',
          isUser ? 'justify-end' : 'justify-start'
        )}>
        {isUser && <div className={'mr-auto rounded-md  w-[48px]'} />}
        <div className={cn('flex flex-col gap-y-2.5', isUser && 'items-end')}>
          <p
            className={cn(
              'body-2 w-fit px-[30px] py-[16px] flex-wrap rounded-[30px] leading-[140%] ',
              isUser ? 'bg-white   text-black' : 'bg-white/10 text-white'
            )}>
            {msg.content}
          </p>
        </div>

        {!isUser && <div className={'ml-auto rounded-md  w-[48px]'} />}
      </div>
    </div>
  );
}
