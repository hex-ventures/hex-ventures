/*!
 * Blog Template
 */

import React from 'react'
import Link from 'gatsby-link'

import Profile from '../components/profile'

import Particles from 'react-particles-js'
import particlesConfig from '../../config/particles'

import Hexagon from 'react-hexagon'

import colors from '../../config/colors'

import dateFormat from 'dateformat'

import 'tachyons'

export default function Template({ data }) {

  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  return (
    <div className={'blog'}>

      {/* Header Particles */}
      <Particles 
        className={`vh-25 w-100`}
        params={particlesConfig}
      />

      {/* Blog Post */}

      {/* Title Header */}
      <div className={`dt w-100`}>
        {/* Title */}
        <h1 className={`dtc w-50 vh-25 bg-navy white pa4 f2-ns f3 v-mid tr`}>
          {frontmatter.title}
        </h1>

        {/* Subtitle */}
        <h1 className={`dtc w-50 vh-25 pa3 bg-white navy f4-ns f5 lh-copy tl v-mid`}>
          <span>{frontmatter.subtitle}</span><br />
          {/* Tags */}
          <div className={`w-100 tc flex flex-wrap`}>
            {frontmatter.tags.map(tag => (
              <span className={`pa1 f5-ns f6 light-blue ttl`} key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </h1>
      </div>

      {/* Author Date */}
      <div className={`dt w-50-ns w-100 center`}>
        {/* Author */}
        <h1 className={`dtc w-50 bg-white navy pa4 f4 v-mid tc`}>
          {frontmatter.author}
        </h1>

        {/* Date */}
        <h1 className={`dtc w-50 pa3 bg-navy white f5 lh-copy v-mid tc`}>
          {dateFormat(frontmatter.date, 'longDate')}<br />
        </h1>
      </div>

      {/* Content */}
      <div className={'navy pa4 tj'}>

        {/* Body */}
        <div
          className={'measure center lh-copy'}
          dangerouslySetInnerHTML={{ __html: html }}
        />

      </div>

      {/* Footer Particles */}
      <Particles 
        className={`vh-25 w-100`}
        params={particlesConfig}
      />
    </div>
  )
}

/*!
 * GraphQL
 */

export const blogTemplateQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        date
        title
        subtitle
        author
        tags
      }
    }
  }
`