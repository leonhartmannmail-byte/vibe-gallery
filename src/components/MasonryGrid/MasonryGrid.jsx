import Masonry from 'react-masonry-css'
import './MasonryGrid.css'

const breakpointColumns = {
  default: 4,
  1440: 3,
  1024: 3,
  768: 2,
  500: 1
}

function MasonryGrid({ children }) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="masonry-grid"
      columnClassName="masonry-column"
    >
      {children}
    </Masonry>
  )
}

export default MasonryGrid
