# Overview

## What this is:

`NodeList.js` makes using the **Native DOM APIs** on an `Array` of `Nodes` as easy as `jQuery` with the benefits of it being extremely small at around **4k minified**, and the browser as a dependency **(Making It The Most Interesting Part)**.

# `NodeList.js` Usage:

Notice first that `$$` is used, the reason this is used for selecting `DOM Nodes` is because if we open up devtools and type in the following:

```JS
$$('div'); // Will return a NodeList
```

## The `HTML` we'll use DOM manipulate on:
```HTML
<body>
	<div id="container" class="cont">
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
		<div class="child"></div>
	</div>
</body>
```

## Let's start of by querying `#container`'s children:

Each of the following returns an `Array of Nodes` (The Library's `NodeList`, not the browser's native `NodeList`)
```JS
// Method 1
$$('#container div');

// Method 2
$$('#container').children;

// Method 3
$$('div div');
```

If we pass a query string there's a second argument we can pass as the scope:
```JS
let container = document.getElementById('container');
$$('div', container); // returns an array of each "div" in "#container div" children 
```

Which would be equivalent to: (Need to Revaluate To Former)
```JS
// This returns the browser's NodeList instead of the Library's NodeList
container.querySelectorAll('div'); 
```

We can pass nodes as arguments:
```
$$(document, document.body); // returns NodeList
```

We can also pass 1 `Array` of Nodes or a `NodeList` or an `HTMLCollection` **Will not be flattened, to flatten use [`concat()`](https://github.com/eorroe/NodeList.js#concat)**:
```
$$([document, document.body]); // returns NodeList
```

## *Getting* properties of each `Node`:

How we would normally do it:
```JS
let children = document.getElementsByClassName('child');
```

Now we would get properties on the `#container`'s children:
```JS
for(let i = 0, l = children.length; i < l; i++) {
 	children[i].id; // ''
	children[i].nodeName; // 'DIV'
	children[i].className; // 'child'
}
```

Here's how we would do it with `nodeList.js`:
```JS
$$('.child').id; // ['', '' ... x10]
$$('.child').nodeName; // ['DIV', 'DIV' ... x10]
$$('.child').className; // ['child', 'child' ... x10]
```

Therefore we would read each property just like we would with a single `Node` :)

**Notice** how it returns an `Array` of the property's value, meaning we can select them by `index` and use any `Array Methods` on them, we'll see when we get to the [looping](https://github.com/eorroe/NodeList.js#looping).

## *Setting* properties on each `node`:

Let's continue using the `children` variable, so this is how we would set properties on the `children`:
```JS
let children = document.getElementsByClassName('child');

for(let i = 0, l = children.length; i < l; i++) {
    children[i].className = 'containerChild';
    children[i].textContent = 'This is some text';
}
```

Here's how we'd do it with `NodeList.js`:
```JS
$$('.child').className = 'containerChild';
$$('.child').textContent = 'This is some text';
```

## *Calling* methods on each `node`:

Still using the `children` variable:

Let's add an event listener to each node, even though `event delegation` would be best, but for the sake of this example:
```JS
let children = document.getElementsByClassName('child');

for(let i = 0, l = children.length; i < l; i++) {
	children[i].textContent = "Has Not Been Clicked";
	children[i].addEventListener('click', function() {
		children[i].textContent = "Clicked";
    	});
}
```
Here's how we'd do it with `NodeList.js`:
```JS
$$('.child').textContent = "Has Not Been Clicked";

$$('.child').addEventListener('click', function() {
	this.textContent = "Clicked";
});
```

So cool right? We can use any `Native DOM method`:

Let's set some attributes:
```JS
$$('.child').setAttribute('class', 'child div');

// For setting the class we could just do:
$$('.child').className = 'child div';
```

Clicking the elements:
```JS
$$('.child').click();
```

Removing the elements:
```JS
$$('.child').remove();
```

*I think you're getting the point: any `Native DOM Method` that every `Node/Element` inherits you could just call on the `NodeList` and it'll be called on each element.*

**BTW:** All `DOM` Methods that would normally return `undefined` when called on a *single* `Node` will return the **same** `NodeList` back to allow Method Chaining. Like `setAttribute()`.

For Example: (Need To Add Example)
```JS
	?.?.setAttribute(?, ?);
```

## Looping
We'll just remove the nodes from the `DOM` as examples:

Using a `for` loop:
```JS
let nodes = $$('.child');
for(let i = 0, l = nodes.length; i < l; i++) {
	nodes[i].remove();
}
```

Using `forEach`:
```JS
// Removes all Nodes and returns same the NodeList to allow method chaining
$$('.child').forEach(function(node) {
	node.remove();
});
```

Using ES6 `for-of`:
```JS
let nodes = $$('.child');

for(let node of nodes) {
	node.remove();
}
```

But we can just do:

```JS
$$('.child').remove();
```

Looping through the properties:
```JS
// Returns Array of style objects (CSSStyleDeclaration)
let styles = $$('.child').style;

for(let i = 0, l = styles.length; i < l; i++) {
	styles[i].color = 'red';
}

styles.forEach(function(style) {
	style.color = 'red';
});

for(let style of styles) {
	style.color = 'red';
}

// OR loop through the nodes themselves
let nodes = $$('.child');

for(let i = 0, l = nodes.length; i < l; i++) {
	nodes[i].style.color = 'red';
}

nodes.forEach(function(node) {
	node.style.color = 'red';
});

for(let node of nodes) {
	node.style.color = 'red';
}
```

# Array Methods

## Slice
```JS
// Returns NodeList containing first Node
$$('.child').slice(0, 1);
```

## Map
Mapping is easy just get the property just like we would on a **single** Node
```JS
// Returns an Array of the id of each Node in the NodeList
$$('#container').id;

// No need for
$$('#container').map(function(element) {
	return element.id;
});

// Map() Checks if Array is fully populated with nodes so returns a NodeList populated with firstChld nodes
$$('#container div').map(function(div) {
	return div.firstChild;
});

// Maps the firstChild node and removes it, and returns the NodeList of firstChild Nodes
$$('#container').map(function(div) {
	return div.firstChild;
}).remove();

// Or:
$$('#container').firstChild.remove();
```

## Filter
```JS
// Filter out the #container div
$$('div').filter(function(div) {
	return !div.matches('#container');
});
```

## Reduce
I couldn't think of a better example for using Reduce on a NodeList (but it's possible)
```JS
let unique = $$('div').reduce(function(set, div) {
	set.add(div.parentElement);
	return set;
}, new Set());

// Cleaner Example
let set = new Set();

let reducerFunc = function(set, div) {
	set.add(div.parentElement);
	return set;
}

let unique = $$('div').reduce(reducerFunc, set);
```

There's also `reduceRight()`

## Concat

The following `concat()` methods all return a new concatenated `NodeList` (Not affecting the `NodeList` that `concat()` is being called on)
```JS
let divs = $$('div');

// Method 1 passing a Node
let divsAndBody = divs.concat(document.body);

// Method 2 passing an Array of Nodes
let divsAndBody = divs.concat([document.body]);

// Method 3 passing a NodeList
let divsAndBody = divs.concat($$('body'));

// Method 4 passing an Array of NodeList
let divsAndBody = divs.concat([$$('body')]);

// Method 5 passing multiple Nodes as arguments
let divsAndBodyAndHTML = divs.concat(document.body, document.documentHTML);

// Method 6 passing multiple Arrays of Nodes as arguments
let divsAndBodyAndHTML = divs.concat([document.body], [document.documentHTML]);

// Method 7 passing multiple Arrays of NodeList as are arguments
let divsAndBodyAndHTML = divs.concat([$$('body')], [$$('html')]);
```

`Concat()` is recursive so you can pass an `Array` that is as deep as you'd like.

Now if you pass anythinng that's not a `Node`, `NodeList`, `HTMLCollections`, `Array` or deep `Array of Arrays` that contain something other than a `Node`, `NodeList`, `HTMLCollections`, `Array` will **Throw** an `Error`.

## Push
```JS
let children = $$('.child');
let div = document.createElement('div');

div.setAttribute('class', 'child');

// Pushes the created div element, and returns the same NodeList to allow method chaining.
children.push(div);
```

## Pop
```JS
let divs = $$('div');

// Removes last Node in the NodeList and returns a NodeList of the removed Nodes
divs.pop();
```

`pop()` takes an optional argument of how many `Nodes` to **POP**
```JS
// Removes last 2 Nodes in the NodeList and returns a NodeList of the removed Nodes
divs.pop(2);
```

## Shift
```JS
let divs = $$('div');

// Removes first Node in the NodeList and returns a NodeList of the removed Nodes
divs.shift();
```

`shift()` also takes an optional argument of how many `Nodes` to **SHIFT**
```JS
// Removes first 2 Nodes in the NodeList and returns a NodeList of the removed Nodes
divs.shift(2);
```

## Unshift
```JS
let divs = $$('div');

// Inserts/unshifts the document.body into the beginning of the NodeList and returns the same NodeList to allow method chaining.
divs.unshift(document.body);
```

## Splice

Let's replace the first element which would be #container with document.body
```JS
let divs = $$('div.child'); // array of #container children elements

// Removes the first Element, and returns a NodeList of the spliced Nodes
divs.splice(0, 1);
```

## Sort
```JS
let divs = $$('.child');

// Gives each div a data-index attribute
divs.forEach(function(div, index) {
	div.dataset.index = index;
});

// Reverse the NodeList and returns the same NodeList
divs.sort(function(div1, div2) {
	return div2.dataset.index - div1.dataset.index;
});
```

## Reverse
```JS
// Returns the same NodeList, but reversed
$$('div').reverse();
```

## Join
I didn't put a `join` method for `NodeLists` because it'd be useless on the actual Nodes:
```JS
// Returns "[object HTMLDivElement], [object HTMLDivElement] ..."
$$('.child').join();
```

Therefore you can still use it when mapping out properties:
```JS
// Returns "child,child,child,child,child,child,child,child,child,child"
$$('.child').className.join();
```

## Includes
```JS
// Returns true if passed Node is included in the NodeList
$$('body').includes(document.body); // returns true
```

## Find
```JS
// Returns div with classnName "container":
$$('div').find(function(div) {
	return div.className === "container";
});
```

## FindIndex
```JS
// Returns 0
$$('body').findIndex(function(el) {
	return el === el;
});
```

**There may be `DOM` methods that are the same name as the ones of `Array.prototype` in the future, or you may just want to convert the `NodeList` to an `Array` therefore you can use as a native `Array`**:


## The `asArray` property
```JS
$$('body').asArray; // returns Array

$$('body').asArray.forEach(function() {...}); // uses native Array method therefore you cannot chain
```

Ok now how about dealing with elements that have unique properties. Like `HTMLAnchorElement(s)` they have the `href` property which is not inherited from `HTMLElement`. There are no `HTMLAnchorElements` in this example but here's how you'll deal with it.

# Special Methods

## Get
```JS
// Returns undefined because it's a unique property that every element does not inherit
$$('a').href

// Returns an Array of href values
$$('a').get('href');
```

`Get()` can also be used on an `Array` of properties:
```JS
// Returns an Array of the value of each node.style.color
$$('.child').style.get('color');
```

## Set
```JS
// Sets the href property of each Node in NodeList
$$('a').set('href', 'https://www.example.com/');
```

`set()` will only set the properties on the `Nodes` who's properties are not undefined:

```JS
$$('div, a').set('href', 'https://www.example.com/');
```

`href` will only be set on the `<a>` elements and not the `<div>`s

`set()` can also be used on an `Array` of properties:
```JS
// Sets each element's color to red and returns the Array of styles back
$$('.child').style.set('color', 'red');
```

We can also set multiple properties:
```JS
$$('.child').set({
 textContent: 'Hello World',
 className: 'class1 class2'
});
```

Same with mapped properties:
```JS
$$('.child').style.set({
 color: 'red',
 background: 'black'
});
```

Remember we can chain:
```JS
$$('.child').set({
 textContent: 'Hello World',
 className: 'class1 class2'
})

.style.set({
 color: 'red',
 background: 'black'
});
```

## Call
There are methods which are unique to certain elements. This is how we would call those methods:
```JS
$$('video').call('pause');
```

Or we could just loop through the elements and call the methods

What about passing arguments:
```JS
// Returns Array of `CanvasRenderingContext2D`
$$('canvas').call('getContext', '2d');
```

If the method called on any of the elements returns something, an `Array` of those returned items would be returned from `call()` otherwise the `NodeList` will be returned to allow method chaining.

## The Item Method
The browser's native `item(index)` method does the same as `NodeList[index]` but in the Library it returns that `Node` as a the Library's `NodeList` (If you know `jQuery` it's the same as jQuery's `eq()` method)
```JS
// returns the <html> element
$$('html, body')[0];

// returns my NodeList [<html>]
$$('html, body').item(0);
```

This is so that we can keep using the same properties/methods of my NodeList, instead of having to `slice` out the one `Node`

## The `owner` property:
All the owner propety does is give back the `NodeList` that the property was mapped from:
```JS
let elements = $$('.child');
elements.style.owner === elements; // true
```

So we can do all kinds of stuff:

Remember mapping `style` returns an `Array` of `CSSStyleDeclarations`
```JS
$$('.child').style;
```

This will give back the `NodeList` which `style` was mapped from:
```JS
let childs  = $$('.child');
childs.style.owner === childs; // true
```

If you know `jQuery` its the same as its `prevObj` property

# Adding Our Own Methods:
```JS
$$.NL.myMethod = function() {
	// We have to write own loop here if we want to call this on each Node or use:
	this.forEach(function(node) {
		// do something with each node
	});
}
```

# NodeListJS Compatability

| Browser | Version |
| --------|---------|
| FireFox | 6+      |
| Safari  | 5.0.5+  |
| Chrome  | 6+      |
| IE      | 9+      |
| Opera   | 11+     |

**Attention:** You have to realize that this library's dependent on the browser it's running (which is beneficial, so it automatically updates when the browser updates the `DOM` with new properties/methods) meaning: let's say the property `hidden` doesn't exist in the browser's `DOM` API we can't do: `$$('.child').hidden = true;`
