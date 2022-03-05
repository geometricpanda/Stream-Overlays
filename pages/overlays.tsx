import {GetServerSideProps} from 'next';
import {FC} from 'react';

import {Twitch} from '../apis/twitch';
import {Channel} from '../apis/twitch.interface';

import Toolbar from '../components/toolbar';



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

  return (
    <Toolbar title={title}
             twitter={twitter}
             twitch={twitch}
             github={github}/>
  )

}

export default Overlays;
