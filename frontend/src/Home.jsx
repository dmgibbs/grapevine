import React from 'react'


// Client-side model
import Resource from './models/resource'
const PostStore = Resource('posts')

class Posts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: [],
      errors: null
    }
  }

  componentDidMount() {
    PostStore.findAll()
    .then((result) => this.setState({posts: result}))
    .catch((errors) => this.setState({errors: errors}))
  }

  render() {
    return (

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {this.state.posts.map((post, index) => (
                <tr key={index}>
                  <td>{post.id}</td>
                  <td>{post.description}</td>
                </tr>
              ))}
            </tbody>
          </table>

    )
  }
}

export default Posts