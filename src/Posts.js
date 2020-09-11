import React, { useEffect, useState } from 'react'
import { API, Storage } from 'aws-amplify'
import { listPosts } from './graphql/queries'
import { onCreatePost } from './graphql/subscriptions'

function Posts() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetchPosts()
    const subscription = API.graphql({ query: onCreatePost }).subscribe({
      next: async (post) => {
        const newPost = post.value.data.onCreatePost
        const signedImg = await Storage.get(newPost.imageKey)
        setPosts((prevPost) => [
          { id: newPost.id, title: newPost.title, imageUrl: signedImg },
          ...prevPost,
        ])
      },
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchPosts() {
    const postData = await API.graphql({
      query: listPosts,
    })
    const rawPosts = postData.data.listPosts.items
    const posts = await Promise.all(
      rawPosts.map(async ({ id, title, imageKey }) => {
        const signedImg = await Storage.get(imageKey)
        return { id, title, imageUrl: signedImg }
      })
    )
    setPosts(posts)
  }
  return (
    <div>
      <h2 style={heading}>Posts</h2>
      {posts.map((post) => {
        return (
          <div key={post.id}>
            <img src={post.imageUrl} alt="" style={postImage} />
            <h3>{post.title}</h3>
          </div>
        )
      })}
    </div>
  )
}

const heading = { margin: '20px 0' }
const postImage = { width: 400 }

export default Posts
