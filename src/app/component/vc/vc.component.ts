import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SocketService } from "src/app/services/socket.service";
import Peer from "simple-peer";
import { environment } from "../../../environments/environment";
declare var AppController: any;

@Component({
  selector: "app-vc",
  templateUrl: "./vc.component.html",
  styleUrls: ["./vc.component.css"],
})
export class VcComponent implements OnInit {
  @ViewChild("remoteVideo") remoteVideoRef: any;
  @ViewChild("localVideo") localVideoRef: any;

  private userid: string = "";
  private localStream: any;
  private playing: boolean = false;
  private streamRecieved: boolean = false;
  callerStream: any;
  myStream;
  myId;
  callerSignal;
  callerInfo;
  incomingCall;

  constructor(
    private route: ActivatedRoute,
    public socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.socketService.initSocket();
    this.startUserMedia();
    this.socketService.onEvent("myId").subscribe((id) => {
      this.myId = id;
      console.log(" this.myId: ", this.myId);
    });

    this.socketService.onEvent("join").subscribe((config) => {
      console.log("config: ", config);
      // const loadingParams = {
      //   errorMessages: config.error_messages ? config.error_messages : [],
      //   warningMessages: config.warning_messages ? config.warning_messages : [],
      //   isLoopback: config.is_loopback,
      //   roomId: config.room_id,
      //   roomLink: config.room_link,
      //   mediaConstraints: config.media_constraints,
      //   offerOptions: config.offer_options,
      //   peerConnectionConfig: config.pc_config,
      //   peerConnectionConstraints: config.pc_constraints,
      //   iceServerRequestUrl: config.turn_url,
      //   iceServerTransports: config.turn_transports,
      //   wssUrl: config.wss_url,
      //   wssPostUrl: config.wss_post_url,
      //   bypassJoinConfirmation: config.bypass_join_confirmation,
      //   versionInfo: config.version_info ? config.version_info : [],
      //   roomServer: environment.socketURL,
      // };
      // console.log("environment.socketURL: ", environment.socketURL);
      // this.appRtc = new AppController(loadingParams);
      // console.log("this.appRtc: ", this.appRtc);
    });

    // this.socketService.onEvent("hey").subscribe((data) => {
    //   console.log("incomingCall:hey ", data);
    //   this.incomingCall = true;
    //   this.callerInfo = data.from;
    //   this.callerSignal = data.signal;
    // });

    // this.socketService.turn().subscribe((res) => {
    //   const iceServers = JSON.parse(res).iceServers;
    //   console.log("iceServers: ", iceServers);
    //   this.iceServers = iceServers;
    // });
  }
  appRtc;

  get users() {
    return this.socketService.activeUsers;
  }
  isStreamAvailable;
  startUserMedia(config?: any, cb = () => {}): void {
    let mediaConfig = {
      video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
      audio: false,
    };

    if (config) {
      mediaConfig = config;
    }

    const n = <any>navigator;
    n.getUserMedia =
      n.getUserMedia ||
      n.webkitGetUserMedia ||
      n.mozGetUserMedia ||
      n.msGetUserMedia;
    n.getUserMedia(
      mediaConfig,
      (stream: MediaStream) => {
        this.myStream = stream;
        this.localVideoRef.nativeElement.srcObject = this.myStream;
        cb();
      },
      (err) => {
        this.isStreamAvailable = false;
        console.error(err);
      }
    );
  }

  roomId = "12121215";
  params = null;
  join() {
    this.startUserMedia({ video: true }, () => {
      console.log("->>>started");
      this.socketService.join(this.roomId).subscribe((res) => {
        if (res.result === "SUCCESS") {
          this.params = res.params;
          console.log("this.params: ", this.params);
          this.appRtcCreatePeer();
        } else {
          console.log("connection already exists: ", this.params);
        }
      });
    });
  }
  iceServers: [
    // {
  //   urls: ["turn:40.80.93.209:3478"];
  //   username: "chat";
  //   credential: "nochat";
  // },
  // {
  //   urls: ["turn:numb.viagenie.ca"];
  //   username: "sultan1640@gmail.com";
  //   credential: "98376683";
  // },
  // { urls: ["stun:stun.l.google.com:19302"] },
  // { urls: ["stun:stun1.l.google.com:19302"] }
  ];
  peer = null;
  appRtcCreatePeer() {
    this.startUserMedia();

    this.peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: this.iceServers,
        stream: this.myStream,
      },
    });

    this.peer.on("signal", (data) => {
      console.log("signal: from remote ", data);
      const message = JSON.stringify(data);
      this.peer.signal(message);
      this.socketService
        .message(this.roomId, this.params.client_id, message)
        .subscribe((res) => {
          console.log("res:message ", res);
        });
    });

    this.peer.on("stream", (stream) => {
      console.log("stream:from -> remotestream ", stream);
      this.remoteVideoRef.nativeElement.srcObject = stream;
      this.callerStream = stream;
    });

    if (this.params.messages.length > 0) {
      this.params.messages.forEach((msg) => {
        const signal = JSON.parse(msg);
        console.log("signal: to remote", signal);
        this.peer.signal(signal);
      });
    }
  }

  activeCallerId = null;
  candidate = false;
  call(userId): void {
    this.activeCallerId = userId;
    console.log("this.activeCallerId: ", this.activeCallerId);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {
        iceServers: [
          // {
          //   urls: "stun:numb.viagenie.ca",
          //   username: "sultan1640@gmail.com",
          //   credential: "98376683",
          // },
          {
            urls: "turn:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683",
          },
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
      stream: this.myStream,
    });

    this.socketService.onEvent("message").subscribe((data) => {
      if (data.from === "app") {
        console.log("message:-->>>> ", data);
        if (data.type === "offer") {
          const offer = {
            type: data.type,
            sdp: data.sdp,
          };
          peer.signal(offer);
          this.candidate = false;
        }
        if (!this.candidate && data.type === "candidate") {
          this.candidate = true;
          console.log("message:candidate-->>>> ", data);
          peer.signal(data);
        }
      }
    });

    peer.on("signal", (data) => {
      console.log("signal: call from us ", data);
      this.socketService.emitEvent("message", {
        signalData: data,
        from: this.myId,
        userToCall: userId,
        to: this.activeCallerId,
      });
    });

    peer.on("connect", (data) => {
      console.log("connect>>>>data: ", data);
    });
    peer.on("data", (data) => {
      console.log("data:data>>>>> ", data);
    });

    peer.on("stream", (stream: MediaStream) => {
      console.log("stream:from -> remotestream ", stream);
      // const remoteStream = new MediaStream();
      // remoteStream.addTrack(stream.getVideoTracks()[0]);
      this.callerStream = stream;
    });

    // this.socketService.onEvent("callAccepted").subscribe((signal) => {
    //   console.log("signal: ", signal);
    //   peer.signal(signal);
    // });
  }

  acceptCall(): void {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: this.myStream,
    });
    this.incomingCall = false;

    peer.on("signal", (data) => {
      console.log("data: remote", data);
      this.socketService.emitEvent("acceptCall", {
        signal: data,
        to: this.callerInfo,
      });
    });

    peer.on("stream", (stream) => {
      console.log("stream:remote ", stream);
      this.remoteVideoRef.nativeElement.srcObject = stream;
      this.callerStream = stream;
    });

    peer.signal(this.callerSignal);
  }
}
