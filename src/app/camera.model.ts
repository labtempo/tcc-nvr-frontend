export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  rtsp_url_low?: string;
  visualisation_url_hls?: string;
  visualisation_url_webrtc?: string;
  path_id: string;
  path_id_low?: string;
  is_recording: boolean;
  created_by_user_Id?: number;

}
