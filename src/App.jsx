import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false); // ✅ Track mute state
  const [myStream, setMyStream] = useState(null); // ✅ Store local stream

  const myAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: "collabflow-backend.onrender.com",
      port: 443,
      path: "/peerjs",
      secure: true,
    });

    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("call", (incomingCall) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        setMyStream(stream); // ✅ Store stream globally
        myAudioRef.current.srcObject = stream;
        incomingCall.answer(stream);
        incomingCall.on("stream", (remoteStream) => {
          remoteAudioRef.current.srcObject = remoteStream;
        });
        setCall(incomingCall);
      });
    });

    setPeer(newPeer);
  }, []);

  const callPeer = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setMyStream(stream); // ✅ Store stream globally
      myAudioRef.current.srcObject = stream;
      const outgoingCall = peer.call(remotePeerId, stream);
      outgoingCall.on("stream", (remoteStream) => {
        remoteAudioRef.current.srcObject = remoteStream;
      });
      setCall(outgoingCall);
    });
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
      remoteAudioRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0]; // Get audio track
      audioTrack.enabled = !audioTrack.enabled; // Toggle audio
      setIsMuted(!audioTrack.enabled); // Update state
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Your Peer ID: {peerId}</h2>
      <input
        type="text"
        placeholder="Enter Peer ID to Call"
        value={remotePeerId}
        onChange={(e) => setRemotePeerId(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px", width: "300px" }}
      />
      <br />
      <button
        onClick={callPeer}
        disabled={!remotePeerId}
        style={{ padding: "10px", margin: "10px" }}
      >
        Call
      </button>
      <button
        onClick={endCall}
        disabled={!call}
        style={{ padding: "10px", margin: "10px" }}
      >
        End Call
      </button>
      <button
        onClick={toggleMute}
        disabled={!call}
        style={{
          padding: "10px",
          margin: "10px",
          backgroundColor: isMuted ? "red" : "green",
          color: "white",
        }}
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>
      <div>
       
        <audio ref={myAudioRef} autoPlay muted></audio>
      </div>
      <div>
        
        <audio ref={remoteAudioRef} autoPlay></audio>
      </div>
    </div>
  );
};

export default App;
