import mongoose from 'mongoose'

const blogSchema = mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, default: '' },
  catImg: { type: String, default: '' },
  images: [ { type: String } ],
  category: { type: String, default: 'General' },
  author: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

const Blog = mongoose.model('Blog', blogSchema)
export default Blog
