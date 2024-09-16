'use client'
import { Box, Stack, TextField, Button} from '@mui/material'
import Image from "next/image"
import { useState } from 'react'

 import Head from 'next/head';
 import Spline from "@splinetool/react-spline";
 import styles from "./styles.module.css";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi I'm the NeXara Chatbot Agent, how can I assist you today?`,
    },
    ])

    const [message, setMessage] = useState('')

    const sendMessage = async () => {
      setMessage('')
      setMessages((messages)=>[
        ...messages,
        { role: "user", content: message },
        { role: "assistant", content: '' },

    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message }]),
    }).then( async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let result = ''
      return reader.read().then(function processText({ done, value }){
        if (done){
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text, 
            },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }
  return (
    <Box
      width = "100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="visible"
    >
 <h1 style={{ fontSize: '30px', color: 'white', zIndex: 1, position: 'absolute', top: '25px', left: '23px' }}>
         NeXara <br />
         Personal AI Chatbot
         </h1> {/* Keep the header */}
        <p style={{ fontSize: '20px', color: 'white', zIndex: 1, position: 'absolute', top: '130px', left: '23px' }}>Ask me anything!</p>

       <main className={`${styles.main}`}>
         <Spline scene="https://prod.spline.design/Gf5OVTklVL7MOecY/scene.splinecode" 
           style={{
            position: 'absolute',
            top: 0,
            left: 0,
           width: '100vw',
           height: '110vh',
           zIndex: '-1',
         }} />
       </main>






      <Stack
        direction= "column"
        width = "800px"
        height = "850px"
        border = "1px solid black"
        p = {2}
        spacing = {3}
        position="relative"
         zIndex="1"
        backgroundColor="rgba(0,0,0,0.5)"
      >
        <Stack
          direction="column"
          spacing = {2}
          flexGrow={1}
          overflow= "auto"
          maxHeight= "100%"
        >
          {messages.map((message, index) => (
              <Box
                key = {index}
                display = 'flex'
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant' 
                      ? 'primary.main'
                      : 'secondary.main'

                }
                color = "white"
                borderRadius={16}
                p={3}
                style={{ fontSize: '20px'}}
              
              >
                {message.content}

              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction= "row" spacing={2}>
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: { color: 'white' },

            }}
          />
          <Button variant ="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  )
}