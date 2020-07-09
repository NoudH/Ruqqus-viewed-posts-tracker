// ==UserScript==
// @name         Ruqqus viewed posts tracker
// @namespace    Doomness
// @version      0.1
// @description  Tracks the posts you have already seen. Works with RuqES expando button and infinite scroll (not required!).
// @author       +Doomness
// @match        https://ruqqus.com/*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// @grant        none
// @homepageURL  https://github.com/NoudH/Ruqqus-viewed-posts-tracker
// @supportURL   https://github.com/NoudH/Ruqqus-viewed-posts-tracker/issues
// ==/UserScript==

/* jshint esversion: 6 */

let viewedPosts = localStorage.getItem('viewedPosts') ? JSON.parse(localStorage.getItem('viewedPosts')) : [];
let cardCount = $('.card').length;

const addStyle = (style) => {
    style = style instanceof Array ? style.join('\n') : style;
    $('head').append($('<style type="text/css">' + style + '</style>'));
};

addStyle(`
.viewedPost-link {
    color: #805ad5!important;
}
`);

const viewedPostsContainsUrl = (url) => {
	return viewedPosts.filter(x => url.includes(x.url)).length > 0;
};

const rememberLink = ($el, url) => {
	if(!viewedPostsContainsUrl(url)){
		viewedPosts.push({date: new Date(), url: url});
		localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
		$el.addClass('viewedPost-link');
	}
};

const setupRuqesButton = () => {
	$('a.RuqES-by-enefi--button').click(function() {
		console.log('test');
		var $linkEl = $(this).closest('div.card-block.text-left').find('a.stretched-link');
		rememberLink($linkEl, $linkEl.attr('href'));
	});
};

const setupLinkClicked = () => {
	$('a.stretched-link').mousedown(function() {
		var $linkEl = $(this);
		var url = $linkEl.attr('href');
		rememberLink($linkEl, url);
	});
};

const setupViewedPosts = () => {
	while(viewedPosts.length > 999) {
		viewedPosts.shift();
	}
	$('a.stretched-link').filter((_, el) => viewedPostsContainsUrl($(el).attr('href'))).addClass('viewedPost-link');
};

//FIXME: preferably this should trigger when the next page is loaded, but I don't think I can hook into RuqES onNextPageSuccessResponse() function.
const setupInfiniteScrollReload = () => {
	const doc = $(document);
	doc.on('scroll', () => {
		let actualCardCount = $('.card').length;
		if(actualCardCount != cardCount) {
			cardCount = actualCardCount;
			setupViewedPosts();
			setupRuqesButton();
		}
	});
};

const work = () => {
    setupViewedPosts();
	setupLinkClicked();
	setupRuqesButton();
	setupInfiniteScrollReload();
};

$(work);
