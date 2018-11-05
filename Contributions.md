# Jore-map-ui conventions

## Git conventions

* When making a PR, write closes #{*issue_id(s)*} or resolves #{*issue_id(s)*}
* Branch name: {*issue_number*}-{*describing_name*}

**Git columns**

* Backlog *- tasks that are blocked or need planning*
* To do *- tasks that aren't blocked. These tasks should be in priority order.*
* Sprint *- tasks to do in the current sprint*
* In progress *- tasks that are in progress or need review fixes*
* Done sprint *- completed tasks in the current sprint*
* Done *- completed tasks from previous sprints*

## Code conventions

* Indent 4 whitespaces
* In a component, first div's className should be {*componentName*}View
* Always use ```<div>``` instead of ```<span>``` (only use span is there is a reason to use it)
* Use classnames if there are multiple classes
* Use async await instead of promises
* Don't use .bind in jsx, use arrow functions instead


### IModels

* **IDs** are in the same format as in jore.


### MobX

* Use @inject when importing stores whenever possible.

**Annotations**

* Use decorators
* Place decorators above functions
* Use @computed for getters https://mobx.js.org/refguide/computed-decorator.html
* Use @action for functions that modify state https://mobx.js.org/refguide/action.html

Variables order:

```
set foo1
get foo1
set foo2
get foo2

actions
...
```
