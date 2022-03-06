import {NextApiRequest, NextApiResponse} from 'next';
import path from 'path'
import {readFile} from 'fs/promises';

const dir = path.resolve('./public');


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const length = +req.query.length || 5;

  try {
    const wordlist = await readFile(path.join(dir, 'wordle', 'wordlist.txt'), 'utf-8');
    const words = wordlist
      .split('\n')
      .filter(word => word.length === length)
      .map(word => word.trim());

    return res.status(200).json(words);
  } catch (e) {
    res.status(500).json(JSON.stringify(e))
  }


}
