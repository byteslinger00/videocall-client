import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';

const App = () => {
  const [callWindow, setCallWindow] = useState('');
  const [callModal, setCallModal] = useState('');
  const [callFrom, setCallFrom] = useState('');
  const [localSrc, setLocalSrc] = useState(null);
  const [peerSrc, setPeerSrc] = useState(null);
  const [pc, setPc] = useState({});
  const [config, setConfig] = useState(null);

  const startCallHandler = (isCaller, friendID, config) => {
    setConfig(config);
    const newPc = new PeerConnection(friendID);
    newPc.on('localStream', (src) => {
      const newState = { callWindow: 'active', localSrc: src };
      if (!isCaller) newState.callModal = '';
      setCallWindow(newState.callWindow);
      setLocalSrc(newState.localSrc);
      setCallModal(newState.callModal);
    })
    .on('peerStream', (src) => setPeerSrc(src))
    .start(isCaller);
    setPc(newPc);
  };

  const rejectCallHandler = () => {
    socket.emit('end', { to: callFrom });
    setCallModal('');
  };

  const endCallHandler = (isStarter) => {
    if (_.isFunction(pc.stop)) {
      pc.stop(isStarter);
    }
    setPc({});
    setConfig(null);
    setCallWindow('');
    setCallModal('');
    setLocalSrc(null);
    setPeerSrc(null);
  };

  useEffect(() => {
    const handleRequest = ({ from: callFrom }) => {
      setCallModal('active');
      setCallFrom(callFrom);
    };
    
    const handleCall = (data) => {
      if (data.sdp) {
        pc.setRemoteDescription(data.sdp);
        if (data.sdp.type === 'offer') pc.createAnswer();
      } else pc.addIceCandidate(data.candidate);
    };

    const handleEndCall = () => {
      endCallHandler(false);
    };

    socket
      .on('request', handleRequest)
      .on('call', handleCall)
      .on('end', handleEndCall)
      .emit('init');

    return () => {
      socket
        .off('request', handleRequest)
        .off('call', handleCall)
        .off('end', handleEndCall);
    };
  }, [pc]);

  return (
    <div>
      <MainWindow startCall={startCallHandler} />
      {!_.isEmpty(config) && (
        <CallWindow
          status={callWindow}
          localSrc={localSrc}
          peerSrc={peerSrc}
          config={config}
          mediaDevice={pc.mediaDevice}
          endCall={endCallHandler}
        />
      )}
      <CallModal
        status={callModal}
        startCall={startCallHandler}
        rejectCall={rejectCallHandler}
        callFrom={callFrom}
      />
    </div>
  );
};

export default App;
