import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);

  const myAudioRef = useRef();
  const remoteAudioRef = useRef();

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      host: "localhost",
      port: "https://collabflow-backend.onrender.com",
      path: "/peerjs", // ✅ Ensure it matches the backend path
      secure: false, // ✅ Important for local development
    });

    newPeer.on("open", (id) => {
      setPeerId(id);
    });

    newPeer.on("call", (incomingCall) => {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
      <div>
        <h3>My Audio</h3>
        <audio ref={myAudioRef} autoPlay muted></audio>
      </div>
      <div>
        <h3>Remote Audio</h3>
        <audio ref={remoteAudioRef} autoPlay></audio>
      </div>
    </div>
  );
};

export default App;
