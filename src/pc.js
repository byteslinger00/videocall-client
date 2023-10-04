import { PeerConnection } from './communication';

export var pc = {};

export const startCallPc = (isCaller, friendID, setCallWindow, setLocalSrc, setCallModal, setPeerSrc) => {
    pc = new PeerConnection(friendID)
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
}