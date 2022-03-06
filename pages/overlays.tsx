import {GetServerSideProps} from 'next';
import {FC, useState} from 'react';

import {Twitch} from '../apis/twitch';
import {Channel} from '../apis/twitch.interface';

import Toolbar from '../components/toolbar';
import Wordle from '../components/games/wordle';
import useSWR from 'swr';

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

  const {data, error} = useSWR('/api/words?length=7', fetcher)
  const [showWordle, setShowWordle] = useState(true);

  return (
    <>
      <Toolbar title={title}
               twitter={twitter}
               twitch={twitch}
               github={github}/>

      {showWordle && data && <Wordle  words={data}/>}

    </>
  )

}

export default Overlays;
