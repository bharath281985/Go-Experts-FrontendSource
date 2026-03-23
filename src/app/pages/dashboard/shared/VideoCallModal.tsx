import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/app/components/ThemeProvider';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoCallModalProps {
  socket: any;
  callerId: string; // The ID of the person we are calling or receiving call from
  callerName: string;
  isReceivingCall: boolean;
  incomingSignal?: any;
  onClose: () => void;
  currentUserId: string;
}

export default function VideoCallModal({
  socket,
  callerId,
  callerName,
  isReceivingCall,
  incomingSignal,
  onClose,
  currentUserId
}: VideoCallModalProps) {
  const { isDarkMode } = useTheme();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // STUN servers
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        initializePeerConnection(currentStream);
      })
      .catch((err) => {
         console.error('Failed to get local stream', err);
      });

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const initializePeerConnection = (localStream: MediaStream) => {
    peerConnection.current = new RTCPeerConnection(config);

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.current?.addTrack(track, localStream);
    });

    // Listen for remote stream
    peerConnection.current.ontrack = (event) => {
      if (userVideo.current && event.streams[0]) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    // Listen for ice candidates to send to peer
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', {
          to: callerId,
          candidate: event.candidate
        });
      }
    };

    // Socket Event Listeners for Call Flow
    socket.on('callAccepted', async (signal: RTCSessionDescriptionInit) => {
      setCallAccepted(true);
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on('iceCandidate', async (candidate: RTCIceCandidateInit) => {
      if (peerConnection.current) {
        try {
           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
           console.error('Error adding received ice candidate', e);
        }
      }
    });

    socket.on('endCall', () => {
      handleEndCall();
    });

    // If NOT receiving a call, we are the caller -> initiate the call
    if (!isReceivingCall) {
       callUser();
    }
  };

  const callUser = async () => {
     if (!peerConnection.current) return;
     
     const offer = await peerConnection.current.createOffer();
     await peerConnection.current.setLocalDescription(offer);

     socket.emit('callUser', {
       userToCall: callerId,
       signalData: offer,
       from: currentUserId,
       name: 'Current User' // We could pass actual user name
     });
  };

  const answerCall = async () => {
    setCallAccepted(true);
    if (!peerConnection.current || !incomingSignal) return;

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(incomingSignal));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit('answerCall', {
       signal: answer,
       to: callerId
    });
  };

  const handleEndCall = () => {
    setCallEnded(true);
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    socket.emit('endCall', { to: callerId });
    setTimeout(() => onClose(), 1000);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-4xl rounded-2xl overflow-hidden relative ${
            isDarkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'
          }`}
        >
          <div className="flex h-[60vh] bg-black relative">
            {/* Main Video (Remote) */}
            <div className="flex-1 h-full flex items-center justify-center relative">
              {!callAccepted && isReceivingCall ? (
                <div className="text-center text-white">
                   <h2 className="text-2xl font-bold mb-4">{callerName} is calling...</h2>
                   <div className="flex gap-4 justify-center">
                     <button onClick={answerCall} className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 animate-pulse">
                        <Phone className="w-6 h-6 text-white" />
                     </button>
                     <button onClick={handleEndCall} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600">
                        <PhoneOff className="w-6 h-6 text-white" />
                     </button>
                   </div>
                </div>
              ) : !callAccepted && !isReceivingCall ? (
                 <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-2">Calling {callerName}...</h2>
                    <p className="text-neutral-400">Waiting for answer</p>
                 </div>
              ) : (
                 <video
                   playsInline
                   ref={userVideo}
                   autoPlay
                   className="w-full h-full object-cover"
                 />
              )}
            </div>

            {/* PIP Video (Local) */}
            <div className="absolute top-4 right-4 w-48 h-32 bg-neutral-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            {/* Controls */}
            {(!isReceivingCall || callAccepted) && !callEnded && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
