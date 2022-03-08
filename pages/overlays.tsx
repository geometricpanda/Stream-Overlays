import {GetServerSideProps} from 'next';
import {FC, useCallback, useEffect, useRef, useState} from 'react';


import {Twitch} from '../apis/twitch';
import {Channel} from '../apis/twitch.interface';

import Toolbar from '../components/toolbar';
import Wordle, {WordleRef} from '../components/games/wordle';
import useSWR from 'swr';
import {OnChatHandler, OnCommandHandler} from 'comfy.js';

enum APP_COMMANDS {
  Wordle = 'wordle',
}


const fetcher = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init)
    .then(res => res.json())


interface OverlaysProps {
  channel: Channel
}

export const getServerSideProps: GetServerSideProps<OverlaysProps> = async () => {

  const twitch = new Twitch();
  const [user] = await twitch.getBroadcaster('geometricjim');
  const [channel] = await twitch.getChannelInformation(user.id);

  return {
    props: {
      channel,
    },
  }
}

const Overlays: FC<OverlaysProps> = ({channel}) => {

  const {title} = channel;
  const twitter = '@jim_drury';
  const twitch = `twitch.tv/${channel.broadcaster_login}`;
  const github = 'github.com/geometricpanda';

  const {data, error} = useSWR('/api/words?length=5', fetcher)

  const [showWordle, setShowWordle] = useState(false);
  const wordleRef = useRef<WordleRef>(null);

  const onCommand: OnCommandHandler = useCallback((...props) => {
    const [user, command, message, flags, extra] = props;
    switch (command) {
      case APP_COMMANDS.Wordle:
        flags.broadcaster && setShowWordle(state => !state);
        break;

      default:
        wordleRef.current?.onCommand(...props);
        break;
    }
  }, [setShowWordle]);


  const onChat: OnChatHandler = useCallback((...props) => {
    wordleRef.current?.onChat(...props);
  }, []);


  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const ComfyJS = window.ComfyJS;
    ComfyJS.Init('geometricjim');
    ComfyJS.onCommand = onCommand;
    ComfyJS.onChat = onChat;
    return () => ComfyJS.Disconnect();
  }, [channel]);

  return (
    <>
      <Toolbar title={title}
               twitter={twitter}
               twitch={twitch}
               github={github}/>

      {showWordle && data && <Wordle words={data} ref={wordleRef}/>}

    </>
  )

}

export default Overlays;
