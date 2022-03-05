import styles from './index.module.css';
import Image from 'next/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faGithub, faTwitter} from '@fortawesome/free-brands-svg-icons';

interface ToolbarProps {
  github: string;
  title: string;
  twitter: string;
  twitch: string;
}

const Toolbar = ({github, title, twitter, twitch}: ToolbarProps) => (
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

export default Toolbar;
