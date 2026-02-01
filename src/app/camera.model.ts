export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  visualisation_url_hls?: string;
  visualisation_url_webrtc?: string;
  is_recording: boolean;
  created_by_user_Id?: number;

}
