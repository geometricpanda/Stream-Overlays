import {ApiResponseArray, Broadcaster, Channel} from './twitch.interface';
import Process from 'process';

const {TWITCH_API_CLIENT_ID, TWITCH_API_APP_ACCESS_TOKEN} = Process.env;

export class Twitch {

  private app_access_token = TWITCH_API_APP_ACCESS_TOKEN!;
  private app_id = TWITCH_API_CLIENT_ID!;

  private fetch<T>(url: URL): Promise<Array<T>> {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${this.app_access_token}`);
    headers.set('Client-Id', this.app_id);
    return fetch(url.toString(), {headers})
      .then(resp => resp.json())
      .then(({data}) => data)
      .catch(e => console.error(e));
  }

  constructor() {

  }

  async getBroadcaster(login: string) {
    const url = new URL('https://api.twitch.tv/helix/users');
    url.searchParams.set('login', login);
    return this.fetch<Broadcaster>(url);
  }

  async getChannelInformation(broadcaster_id: string) {
    const url = new URL('https://api.twitch.tv/helix/channels');
    url.searchParams.set('broadcaster_id', broadcaster_id);
    return this.fetch<Channel>(url);
  }

}
