import React, { Component, useEffect, useState } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';

function App() {
//   constructor() {
//     super();
//     this.state = {
//       callWindow: '',
//       callModal: '',
//       callFrom: '',
//       localSrc: null,
//       peerSrc: null
//     };
//     this.pc = {};
//     this.config = null;
//     this.startCallHandler = this.startCall.bind(this);
//     this.endCallHandler = this.endCall.bind(this);
//     this.rejectCallHandler = this.rejectCall.bind(this);
//   }

  const [callWindow, setCallWindow] = useState('');
  const [callModal, setCallModal] = useState('');
  const [callFrom, setCallFrom] = useState('');
  const [localSrc, setLocalSrc] = useState(null);
  const [peerSrc, setPeerSrc] = useState(null);
  const [pc, setPc] = useState({});
  const [config, setConfig] = useState(null);

  useEffect(()=>{
    socket
      .on('request', ({ from: callFrom }) => {
        // this.setState({ callModal: 'active', callFrom });
        setCallModal('active');
        setCallFrom(callFrom);
      })
      .on('call', (data) => {
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') pc.createAnswer();
        } else pc.addIceCandidate(data.candidate);
      })
      .on('end', () => endCall(false))
      .emit('init');
      return() => {
        socket.off("request").off("call").off("end");
      }
  },[])
//   componentDidMount() {
    
//   }

  const startCall = (isCaller, friendID, config) => {
    // this.config = config;
    setConfig(config);
    const pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        setCallWindow('active');
        setLocalSrc(src);
        if(!isCaller) setCallModal('');
        // const newState = { callWindow: 'active', localSrc: src };
        // if (!isCaller) newState.callModal = '';
        // this.setState(newState);
      })
      .on('peerStream', (src) => setPeerSrc(src))
      .start(isCaller);
    setPc(pc);
  }

  const rejectCall = () =>{
    socket.emit('end', { to: callFrom });
    setCallModal('')
  }

  const endCall = (isStarter) => {
    if (_.isFunction(pc.stop)) {
      pc.stop(isStarter);
    }
    // this.pc = {};
    setPc({});
    // this.config = null;
    setConfig(null);
    // this.setState({
    //   callWindow: '',
    //   callModal: '',
    //   localSrc: null,
    //   peerSrc: null
    // });
    setCallWindow('');
    setCallModal('');
    setLocalSrc(null);
    setPeerSrc(null);
  }

    // const { callFrom, callModal, callWindow, localSrc, peerSrc } = this.state;
    return (
      <div>
        <MainWindow startCall={startCall} />
        {!_.isEmpty(config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={config}
            mediaDevice={pc.mediaDevice}
            endCall={endCall}
          />
        ) }
        <CallModal
          status={callModal}
          startCall={startCall}
          rejectCall={rejectCall}
          callFrom={callFrom}
        />
      </div>
    );
}

export default App;
