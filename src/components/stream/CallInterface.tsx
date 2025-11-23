import React from 'react';
import { 
  useCall, 
  useCallStateHooks, 
  CallingState, 
  SpeakerLayout, 
  CallControls 
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

export const CallInterface: React.FC = () => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex-1 relative">
        <SpeakerLayout />
      </div>
      <div className="p-4 flex justify-center bg-gray-900">
        <CallControls onLeave={() => call?.leave()} />
      </div>
    </div>
  );
};
