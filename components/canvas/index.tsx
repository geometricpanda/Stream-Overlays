import {FC} from 'react';
import styles from './index.module.css';

const Canvas: FC = ({children}) => (
  <div className={styles.canvas}>
    {children}
  </div>
);

export default Canvas;
