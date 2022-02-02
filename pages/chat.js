import { Box, TextField } from '@skynexui/components';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import Header from '../src/components/Header/Header';
import MessageList from '../src/components/MessageList/MessageList';
import SendSticker from '../src/components/SendSticker/SendSticker';

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ4MjMwNSwiZXhwIjoxOTU5MDU4MzA1fQ.xcHQvFY5WoVrCCHjBDrAvATtHk9g44Xjw9fgh9j-oZ4"
const SUPABASE_URL = "https://trtarbwlczbhpjcbgxej.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const getRealTimeMessages = (addMessage) => {
  return supabaseClient
    .from("message")
    .on("INSERT", (res) => {
      addMessage(res.new);
    })
    .subscribe();
}

export default function Chat() {
  const router = useRouter();
  const loggedUser = router.query.username;
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([])

  useEffect(() => {
    supabaseClient
      .from("messages")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setMessageList(data)
      })

    getRealTimeMessages()
  }, [])

  const handleNewMessage = (newMessage) => {
    const message = {
      from: loggedUser,
      text: newMessage,
    }

    supabaseClient
      .from("messages")
      .insert([
        message
      ])
      .then(({ data }) => {
        setMessageList([
          data[0],
          ...messageList
        ])
      })

    setMessageList([
      message,
      ...messageList
    ]);
    setMessage("");
  }

  return (
    <Box
      styleSheet={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https:virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000']
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >
          <MessageList messages={messageList} />
          <Box
            as="form"
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleNewMessage(message)
                }
              }}
            />
            <SendSticker
              onStickerClick={(sticker) => {
                handleNewMessage(':sticker: ' + sticker);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
