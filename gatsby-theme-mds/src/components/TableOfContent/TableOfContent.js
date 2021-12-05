import React, { useEffect, useState, useRef } from 'react';
import { useNavItems } from '../../util/InPageNavItems';
import { Subheading } from '@innovaccer/design-system';
import { Link } from 'gatsby';
import './TableOfContent.css';

const TableOfContent = (props) => {
  const { relativePagePath, location } = props;
  const clickedRef = useRef(false);
  const unsetClickedRef = useRef(null);

  let navItems = useNavItems(relativePagePath);
  const [active, setActive] = useState('');

  useEffect(() => {
    const navIds = getIds(navItems);
    document.body.addEventListener('scroll', (e) => onScrollHandler(e, navIds), true);
    return () => {
      document.body.removeEventListener('scroll', (e) => onScrollHandler(e, navIds), true);
    }
  }, []);

  useEffect(() => {
    let urlHash = '';
    if (location && location.hash) {
      urlHash = location.hash.slice(1);
      setActive(urlHash);
    } else {
      navItems && navItems.length ? setActive(navItems[0].url.slice(1)) : '';
    }
  }, []);

  const onScrollHandler = (e, idList) => {
    // Don't set the active index based on scroll if a link was just clicked
    if (clickedRef.current) {
      return;
    }
    const headerHeight = document.getElementById('mainHeader').getBoundingClientRect().height;
    const viewportHeight = document.body.offsetHeight - headerHeight;
    let resultFound = false;

    idList && idList.forEach((item) => {
      let element = document.getElementById(item);
      if (element && !resultFound) {
        const { top, height } = element.getBoundingClientRect();
        if (top > 0 && viewportHeight > top - height) {
          setActive(item);
          resultFound = true;
        };
      };
    });
  };

  const onClickHandler = (e, itemUrl) => {
    setActive(itemUrl);

    // Used to disable onScrollHandler if the page scrolls due to a click
    clickedRef.current = true;
    unsetClickedRef.current = setTimeout(() => {
      clickedRef.current = false;
    }, 1000);
  };

  function getIds(items) {
    return items.reduce((acc, item) => {
      if (item.url) {
        // url has a # as first character, remove it to get the raw Id
        acc.push(item.url.slice(1));
      }
      if (item.items) {
        acc.push(...getIds(item.items));
      }
      return acc;
    }, []);
  }

  function renderItems(items) {
    return (
      <ul className='table-of-content-list pr-8'>
        {items && items.map((item) => {
          return (
            <li>
              <div
                className={`${active == item.url.slice(1) ? 'active-link' : ''
                  }`}
              >
                <Link
                  to={item.url}
                  onClick={(e) => onClickHandler(e, item.url.slice(1))}
                  className='toc-link'
                  style={{
                    display: `${item.title ? 'inline-block' : 'none'
                      }`,
                  }}
                >
                  {item.title}
                </Link>
              </div>
              {item.items && renderItems(item.items)}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className='d-flex flex-column right-nav-container overflow-hidden'>
      {navItems && navItems.length ? (
        <>
          <Subheading
            appearance='subtle'
            className='pl-6 mt-10'
          >
            CONTENTS
          </Subheading>
          {renderItems(navItems)}
        </>
      ) : (
        ''
      )}
    </div>
  );
};

export default TableOfContent;
