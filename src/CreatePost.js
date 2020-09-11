import React, { useState } from 'react'
import { Button, Input } from 'antd'
import { v4 as uuid } from 'uuid'
import { API, Storage } from 'aws-amplify'
import { createPost } from './graphql/mutations'

const initFormState = {
  title: '',
  image: {},
}

function CreatePost(props) {
  const [formState, setFormState] = useState(initFormState)
  function onChange(key, value) {
    setFormState({ ...formState, [key]: value })
  }
  function setPhoto(e) {
    if (!e.target.files[0]) return
    const file = e.target.files[0]
    setFormState({ ...formState, image: file })
  }

  const { setViewState } = props
  async function savePhoto() {
    const { title, image } = formState
    if (!title || !image.name) return
    const imageKey = uuid() + image.name.replace(/\s/g, '-').toLowerCase()
    await Storage.put(imageKey, image)
    const post = { title, imageKey }
    await API.graphql({
      query: createPost,
      variables: { input: post },
    }) // no need of `graphqlOperation`
    setViewState('viewPosts')
  }

  return (
    <div>
      <h2 style={heading}>Add Post</h2>
      <Input
        placeholder="Title"
        style={withMargin}
        onChange={(e) => onChange('title', e.target.value)}
        // no 'value' props here??
      />
      <input type="file" onChange={setPhoto} style={button} />
      <Button type="primary" style={button} onClick={savePhoto}>
        Save Photo
      </Button>
    </div>
  )
}

const heading = {
  margin: '20px 0',
}
const button = {
  marginTop: 10,
}
const withMargin = {
  marginTop: 10,
}

export default CreatePost
