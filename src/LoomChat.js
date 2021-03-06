import React, {useState, useEffect} from "react";
import {useDispatch} from "react-redux";
import "./LoomChat.css";
import {socket} from "./sockets.js";
import axios from "./axios.js";
import {oldChatMessages} from "./action.js";
import Whiteboard from "./Whiteboard.js";
import Chat from "./ChatApp";
import AllVideos from "./VideoApp";
import ShowUsers from "./ShowUsers";
import {Link} from "react-router-dom";
import {audio,video, hideVideos} from "./action";

export default function LoomChat(props){

    const serverUrl = window.location.href.startsWith("https://loomchat.herokuapp.com") ? 'https://loomchat.herokuapp.com' : "http://127.0.0.1:8080";
    const dispatch = useDispatch();

    const [room, setRoom] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
    const [status, setStatus] = useState(1);
    const [error, setError] = useState("");
    const [canvasVisible,setCanvasVisible] = useState("noWhiteboard");
    const [chatVisible,setChatVisible] = useState("chatnotvisible");
    const [allVideosVisible,setallVideosVisible] = useState(true);
    const [mute, setMute] = useState(true);
    const [myVideo, setMyVideo] = useState(true);
    const [user, setUser] = useState(false);
    const [userOnline, setUserOnline] = useState(false);
    const [endSession, setEndSession] = useState(false);

    useEffect(()=> {
        const param = props.match.params.roomnumber;
        setRoom(param);        
        (async() => {
            const userData = await axios.get(`${serverUrl}/getChatUser/${param}`);
            setUser(userData.data.user); 
            if(userData.data.user){
                socket.emit("useronline", param);
                socket.emit("countdown", param);
                dispatch(oldChatMessages(userData.data.data));
            }            
        })();         
    },[props.match]);

    const sendUserData = () => {
        (async() => {
            const checkRoomSize = await axios.get(`${serverUrl}/checkroomsize/${room}`);
            if(checkRoomSize.data.exceeded){
                setStatus(3);
            } else {
                const check = await axios.post(`${serverUrl}/startLoomChat`, {firstname,lastname,room});
                if(check.data.success){
                    window.location.replace(`/loomChat/${room}`);
                } else {
                    setStatus(2);
                    setError(check.data.error);
                }
            }
                                   
        })(); 
    };

    socket.on("endSession", () =>{
        setEndSession(true);
    });

    socket.on("END", async() => {
        await axios.post(`${serverUrl}/chatlogout`);
        window.location.replace("/");
    });

    useEffect(() => {
        dispatch(audio(mute));
    },[mute]);
    useEffect(() => {
        dispatch(video(myVideo));
    },[myVideo]);
    useEffect(() => {
        dispatch(hideVideos(allVideosVisible));
    },[allVideosVisible]);

    return(
        <div >            
            {!user && 
            <div>        
                <div id="header">LOOM</div> 
                <div id="header2">Connect &amp; Chat</div>
                <div id="noChatUser" className="flexColumn">
                    <div>
                        <h1>Welcome to LOOM</h1>
                        <h5>Start your chat session!</h5>
                    </div>                    
                    {status===1 &&
                        <div className="flexColumn">
                            <input type="text" id="firstname" name="firstname" placeholder="Your firstname" value={firstname} onChange={e => setFirstName(e.target.value)}/> 
                            <input type="text" id="lastname" name="lastname" placeholder="Your lastname" onKeyDown={e => {if(e.key === "Enter"){sendUserData();}}} value={lastname} onChange={e => setLastName(e.target.value)}/>  
                            <input type="submit" value="Join" onClick={sendUserData}></input>
                        </div>
                    }
                    {status===2 &&
                        <div className="flexColumn">
                            <h2>A problem occured</h2>
                            <div className="mailErrorChat">{error}</div>
                            <button type="button" onClick={() => setStatus(1)} className="welcomeButton2">Go back</button>
                        </div>
                    }
                    {status===3 && 
                    <div className="flexColumn">
                        <h4>Sorry,you cannot enter this room.</h4> 
                        <h4>The number of <em>LOOMers</em> has been exceeded!</h4>  
                        <Link to="/" className="noentry">Go to main</Link>
                    </div>                    
                    }                     
                </div>                
            </div>
            }
            {user && 
            <div id="mainLoomChat">
                <AllVideos room={room}/>

                <Chat user={user} room={room} chatVisible={chatVisible}/>

                <Whiteboard room={room} canvasVisible={canvasVisible}/>  

                {userOnline && <ShowUsers userId={user.id}/>}

                {endSession && <div id="endSession">This session ends in 2 minutes!</div>}

                <div id="menu" className="flex">    
                    {!userOnline && <div id="online" onClick={()=>setUserOnline(true)}></div>}
                    {userOnline && <div id="onlineX" onClick={()=>setUserOnline(false)}>X</div>}           
                    <h1>LOOM Chat</h1>
                    <button className="chatButton" type="button"onClick={()=> {
                        if(chatVisible === "chatnotvisible"){
                            setChatVisible("chatisvisible");
                        }else {
                            setChatVisible("chatnotvisible");
                        }
                    }}>Chat</button>
                    <div>
                        {mute && <button id="mute2" type="button" onClick={()=> setMute(false)}></button>}
                        {!mute && <button id="mute1" type="button" onClick={()=> setMute(true)}></button>}
                        {myVideo && <button id="video2" type="button" onClick={()=> setMyVideo(false)}></button>}
                        {!myVideo && <button id="video1" type="button" onClick={()=> setMyVideo(true)}></button>}
                    </div>
                    {allVideosVisible && <button className="chatButton" type="button" onClick={()=> setallVideosVisible(false)}>Hide Videos</button>}
                    {!allVideosVisible && <button className="chatButtonred" type="button" onClick={()=> setallVideosVisible(true)}>Show Videos</button>}
                    <button className="chatButton" type="button" onClick={()=> {
                        if(canvasVisible === "Whiteboard"){
                            setCanvasVisible("noWhiteboard");
                        }else {
                            setCanvasVisible("Whiteboard");
                        }
                    }}>Whiteboard</button>
                    <h2>Hello, {user.firstname}!</h2>
                </div>
            </div>
            }
        </div>
    );
}