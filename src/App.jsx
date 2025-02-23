import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [myStream, setMyStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null); // Incoming call state
  const [callerId, setCallerId] = useState(""); // Store caller's ID

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();

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
      // Instead of auto-answering, show a notification
      setIncomingCall(incomingCall);
      setCallerId(incomingCall.peer); // Store caller ID
    });

    setPeer(newPeer);
  }, []);

  const callPeer = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true }) // ✅ Request video & audio
      .then((stream) => {
        setMyStream(stream);
        myVideoRef.current.srcObject = stream;
        const outgoingCall = peer.call(remotePeerId, stream);
        outgoingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
        setCall(outgoingCall);
      });
  };

  const answerCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true }) // ✅ Get user video/audio
      .then((stream) => {
        setMyStream(stream);
        myVideoRef.current.srcObject = stream;
        incomingCall.answer(stream); // ✅ Answer call AFTER user accepts
        incomingCall.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
        setCall(incomingCall);
        setIncomingCall(null); // ✅ Hide notification
      });
  };

  const rejectCall = () => {
    incomingCall.close(); // Reject the call
    setIncomingCall(null); // Hide notification
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

  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsHide(!videoTrack.enabled);
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

      <button
        onClick={toggleVideo}
        disabled={!call}
        style={{
          padding: "10px",
          margin: "10px",
          backgroundColor: isHide ? "red" : "green",
          color: "white",
        }}
      >
        {isHide ? "Show Video" : "Hide Video"}
      </button>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          <h3>Incoming Call from {callerId}</h3>
          <button
            onClick={answerCall}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "green",
              color: "white",
            }}
          >
            Answer
          </button>
          <button
            onClick={rejectCall}
            style={{
              padding: "10px",
              margin: "10px",
              backgroundColor: "red",
              color: "white",
            }}
          >
            Reject
          </button>
        </div>
      )}

      {/* Video Section */}
      <div>
        <h3>My Video</h3>
        <video
          ref={myVideoRef}
          autoPlay
          muted
          style={{
            width: "300px",
            borderRadius: "10px",
            backgroundColor: "black",
          }}
        ></video>
      </div>

      <div>
        <h3>Remote Video</h3>
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{
            width: "300px",
            borderRadius: "10px",
            backgroundColor: "black",
          }}
        ></video>
      </div>
    </div>
  );
};

export default App;
