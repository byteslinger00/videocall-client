import React, { Component, useEffect, useState } from 'react';
import _ from 'lodash';
// import { socket, PeerConnection } from './communication';
import {socket} from './communication';
// import {PeerConnection} from './communication';
import {pc} from './pc';
import { startCallPc } from './pc';
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
  // const [pc, setPc] = useState({});
  // var pc = {};
  const [config, setConfig] = useState(null);

  useEffect(()=>{
    console.log('created')
    socket
      .on('request', ({ from: callFrom }) => {
        // this.setState({ callModal: 'active', callFrom });
        setCallModal('active');
        setCallFrom(callFrom);
      })
      .on('call', (data) => {
        // alert('calling')
        console.log(pc);
        if (data.sdp) {
          pc?.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') pc?.createAnswer();
        } else pc?.addIceCandidate(data.candidate);
      })
      .on('end', () => endCall(false))
      .emit('init');
      return() => {
        socket.off("request");
        socket.off("call");
        socket.off("end");
      }
  },[])

  useEffect(()=>{
    console.log('Peer changed:');
    console.log(pc)
  },[pc])

//   componentDidMount() {
    
//   }

  const startCall = (isCaller, friendID, config) => {
    // this.config = config;
    setConfig(config);
    startCallPc(isCaller, friendID, setCallWindow,setLocalSrc, setCallModal, setPeerSrc)
    // const pc = new PeerConnection(friendID)
    //   .on('localStream', (src) => {
    //     setCallWindow('active');
    //     setLocalSrc(src);
    //     if(!isCaller) setCallModal('');
    //     // const newState = { callWindow: 'active', localSrc: src };
    //     // if (!isCaller) newState.callModal = '';
    //     // this.setState(newState);
    //   })
    //   .on('peerStream', (src) => setPeerSrc(src))
    //   .start(isCaller);
    // // pc.off("localStream").off("peerStream");
    // setPc(pc);
  }

  const rejectCall = () =>{
    socket.emit('end', { to: callFrom });
    setCallModal('')
  }

  const endCall = (isStarter) => {
    if (_.isFunction(pc?.stop)) {
      pc?.stop(isStarter);
    }
    // setPc({});
    setConfig(null);
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
            mediaDevice={pc?.mediaDevice}
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
