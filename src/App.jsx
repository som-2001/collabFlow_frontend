import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [myStream, setMyStream] = useState(null);

  const myVideoRef = useRef(); // ✅ Local video
  const remoteVideoRef = useRef(); // ✅ Remote video

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
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true }) // ✅ Request video & audio
        .then((stream) => {
          setMyStream(stream);
          myVideoRef.current.srcObject = stream; // ✅ Set local video stream
          incomingCall.answer(stream);
          incomingCall.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream; // ✅ Set remote video stream
          });
          setCall(incomingCall);
        });
    });

    setPeer(newPeer);
  }, []);

  const callPeer = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true }) // ✅ Request video & audio
      .then((stream) => {
        setMyStream(stream);
        myVideoRef.current.srcObject = stream; // ✅ Set local video
        const outgoingCall = peer.call(remotePeerId, stream);
        outgoingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream; // ✅ Set remote video
        });
        setCall(outgoingCall);
      });
  };

  const endCall = () => {
    if (call) {
      call.close();
      setCall(null);
      remoteVideoRef.current.srcObject = null;
    }
  };

  const toggleMute = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
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
        <h3>My Video</h3>
        <video ref={myVideoRef} autoPlay muted style={{ width: "300px", borderRadius: "10px" }}></video>
      </div>

      <div>
        <h3>Remote Video</h3>
        <video ref={remoteVideoRef} autoPlay style={{ width: "300px", borderRadius: "10px" }}></video>
      </div>
    </div>
  );
};

export default App;
