import React from 'react'
import VideoForm from './VideoForm'
import { useParams } from 'react-router-dom'

const UpdateVideo = () => {
    const { videoId } = useParams();
  return (
    <div>
        <VideoForm videoId={videoId} />
    </div>
  )
}

export default UpdateVideo