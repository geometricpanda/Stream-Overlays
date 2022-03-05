import {GetServerSideProps} from 'next';
import {FC} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faGithub, faTwitter} from '@fortawesome/free-brands-svg-icons'
import Image from 'next/image';

import {Twitch} from '../apis/twitch';
import {Channel} from '../apis/twitch.interface';
import styles from './toolbar.module.css';

interface ToolbarProps {
  channel: Channel
}

export const getServerSideProps: GetServerSideProps<ToolbarProps> = async () => {
  const twitch = new Twitch();
  const [user] = await twitch.getBroadcaster('geometricjim');
  const [channel] = await twitch.getChannelInformation(user.id);

  return {
    props: {
      channel,
    },
  }
}

const Toolbar: FC<ToolbarProps> = ({channel}) => {
  const {title} = channel;
  const twitter = '@jim_drury';
  const twitch = `twitch.tv/${channel.broadcaster_login}`;
  const github = 'github.com/geometricpanda';

  return (
    <div className={styles['toolbar']}>
      <div className={styles['toolbar__logo']}>
        <Image src={'/panda.svg'} height={80} width={80} alt={'Panda'}/>
      </div>
      <div className={styles['toolbar__stream']}>
        <div className={styles['toolbar__stream-name']}>{title}</div>
        <div className={styles['toolbar__stream-host']}>{twitch}</div>
      </div>
      <ul className={styles['toolbar__socials']}>
        <li className={styles['toolbar__social']}>
          <FontAwesomeIcon className={styles['toolbar__social-icon']} icon={faTwitter}/>
          <div className={styles['toolbar__social-name']}>{twitter}</div>
        </li>
        <li className={styles['toolbar__social']}>
          <FontAwesomeIcon className={styles['toolbar__social-icon']} icon={faGithub}/>
          <div className={styles['toolbar__social-name']}>{github}</div>
        </li>
      </ul>
    </div>
  )

}

export default Toolbar;
