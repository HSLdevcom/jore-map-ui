# Jore-map-ui conventions

## Git conventions

* When making a PR, write closes #{*card id(s)*} or resolves #{*card id(s)*}
* Branch name: {*card number}-{describing name}

**Git columns**

* Backlog *- tasks that are blocked or need planning*
* To do *- tasks that aren't blocked. These tasks should be in priority order.*
* Sprint *- tasks to do in the current sprint*
* In progress *- tasks that are in progress or need review fixes*
* Done sprint *- completed tasks in the current sprint*
* Done *- all completed tasks*

## Code conventions

* Indent 4 whitespaces
* In a component, first div's className should be {*componentName*}View
* Always use ```<div>``` instead of ```<span>``` (only use span is there is a reason to use it)
* Use classnames if there are multiple classes
* Use async await instead of promises
* Don't use .bind in jsx


### IModels

* **IDs** are in the same format as in jore.

* Use **null** instead of undefined. *For example: routeName: string;*



### Store

**Annotations**

* Place annotations above functions
* Use @computed for getters
* Use @action for functions that modify state

Variables order:

```
set foo1
get foo1
set foo2
get foo2

actions
...
```