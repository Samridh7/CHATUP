import React, {useState,useEffect} from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InfoBar from "../InfoBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer";

import "./Chat.css"

let socket;

const Chat = ({ location }) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [message,setMessage] = useState('');
    const [messages,setMessages] = useState([]);
    const ENDPOINT = "https://lets-chat-up-app.herokuapp.com/";

    useEffect(() => {
        const {name, room} = queryString.parse(location.search);

        setName(name);
        setRoom(room);

        socket = io(ENDPOINT);
        console.log(socket);

        // sending data from front-end to back-end

        socket.emit("join", {name, room}, () => {

        });

        return () => {
            socket.emit("disconnect");

            socket.off();
        }
    },[ENDPOINT, location.search]);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages,message]);
        },[messages]);

        socket.on("roomData", ({ users }) => {
            setUsers(users);
          });
    });

    const sendMessage = (event) => {
        event.preventDefault();

        if(message){
            socket.emit('sendMessage', message, () => {
                setMessage('');
            })
        }
    }

    console.log(message);
    console.log(messages);

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={messages} name={name} />
                <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
            </div>
            <TextContainer users={users} />
        </div>
    )
}

export default Chat;