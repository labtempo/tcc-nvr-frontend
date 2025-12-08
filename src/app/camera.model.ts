export interface Camera {
  id: number;
  name: string;
  rtsp_url: string;
  is_recording: boolean;
  created_by_user_Id?: number;
}
