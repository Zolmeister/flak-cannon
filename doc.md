#User
### create
##### post /api/testapp/users
```js
// req
{
    "info": {
        "abc": "def"
    }
}
```
```js
// res
{
    "info": {
        "abc": "def"
    },
    "id": "46351567-d874-477b-ae23-155444aefdc2",
    "namespace": "testapp"
}
```
### get
##### get /api/testapp/users/d9c9f49c-5131-46f2-b243-5bd1662cc412
```js
// req

```
```js
// res
{
    "group": "123",
    "info": {
        "abc": "def"
    },
    "id": "d9c9f49c-5131-46f2-b243-5bd1662cc412",
    "namespace": "testapp"
}
```
### convert
##### put /api/testapp/users/8a0baed9-38ed-441f-8a6d-7bf85c538cb6/convert/testing
```js
// req

```
```js
// res
{
    "name": "testing",
    "userId": "8a0baed9-38ed-441f-8a6d-7bf85c538cb6",
    "experiments": {
        "convertible": "a",
        "expTest": "red"
    },
    "namespace": "testapp",
    "timestamp": "2014-08-08T21:26:45.485Z"
}
```
#(Admin) User
### set testing group
##### put /api/testapp/users/d9c9f49c-5131-46f2-b243-5bd1662cc412/group/same
```js
// req

```
```js
// res
{
    "group": "same",
    "info": {
        "abc": "def"
    },
    "id": "d9c9f49c-5131-46f2-b243-5bd1662cc412",
    "namespace": "testapp"
}
```
### remove from experiment
##### delete /api/testapp/users/d63f7881-b43d-4419-9f90-bd257941b4cf/experiments/expTest
```js
// req

```
```js
// res
{
    "group": "tester",
    "id": "d63f7881-b43d-4419-9f90-bd257941b4cf",
    "namespace": "testapp",
    "info": {
        "ip": "127.0.0.1",
        "isMobile": false,
        "isiPad": false,
        "isiPod": false,
        "isiPhone": false,
        "isAndroid": false,
        "isBlackberry": false,
        "isOpera": false,
        "isIE": false,
        "isIECompatibilityMode": false,
        "isSafari": false,
        "isFirefox": false,
        "isWebkit": false,
        "isChrome": false,
        "isKonqueror": false,
        "isOmniWeb": false,
        "isSeaMonkey": false,
        "isFlock": false,
        "isAmaya": false,
        "isEpiphany": false,
        "isDesktop": false,
        "isWindows": false,
        "isLinux": false,
        "isLinux64": false,
        "isMac": false,
        "isBada": false,
        "isSamsung": false,
        "isRaspberry": false,
        "isBot": false,
        "isCurl": false,
        "isAndroidTablet": false,
        "isWinJs": false,
        "Browser": "unknown",
        "OS": "unknown",
        "Platform": "unknown",
        "source": ""
    }
}
```
### add to experiment
##### put /api/testapp/users/d63f7881-b43d-4419-9f90-bd257941b4cf/experiments/expTest
```js
// req

```
```js
// res
{
    "group": "tester",
    "id": "d63f7881-b43d-4419-9f90-bd257941b4cf",
    "namespace": "testapp",
    "info": {
        "ip": "127.0.0.1",
        "isMobile": false,
        "isiPad": false,
        "isiPod": false,
        "isiPhone": false,
        "isAndroid": false,
        "isBlackberry": false,
        "isOpera": false,
        "isIE": false,
        "isIECompatibilityMode": false,
        "isSafari": false,
        "isFirefox": false,
        "isWebkit": false,
        "isChrome": false,
        "isKonqueror": false,
        "isOmniWeb": false,
        "isSeaMonkey": false,
        "isFlock": false,
        "isAmaya": false,
        "isEpiphany": false,
        "isDesktop": false,
        "isWindows": false,
        "isLinux": false,
        "isLinux64": false,
        "isMac": false,
        "isBada": false,
        "isSamsung": false,
        "isRaspberry": false,
        "isBot": false,
        "isCurl": false,
        "isAndroidTablet": false,
        "isWinJs": false,
        "Browser": "unknown",
        "OS": "unknown",
        "Platform": "unknown",
        "source": ""
    },
    "experiments": {
        "expTest": "e"
    }
}
```
### add to experiment, with value
##### put /api/testapp/users/d63f7881-b43d-4419-9f90-bd257941b4cf/experiments/expTest/red
```js
// req

```
```js
// res
{
    "experiments": {
        "expTest": "red"
    },
    "group": "tester",
    "id": "d63f7881-b43d-4419-9f90-bd257941b4cf",
    "info": {
        "ip": "127.0.0.1",
        "isMobile": false,
        "isiPad": false,
        "isiPod": false,
        "isiPhone": false,
        "isAndroid": false,
        "isBlackberry": false,
        "isOpera": false,
        "isIE": false,
        "isIECompatibilityMode": false,
        "isSafari": false,
        "isFirefox": false,
        "isWebkit": false,
        "isChrome": false,
        "isKonqueror": false,
        "isOmniWeb": false,
        "isSeaMonkey": false,
        "isFlock": false,
        "isAmaya": false,
        "isEpiphany": false,
        "isDesktop": false,
        "isWindows": false,
        "isLinux": false,
        "isLinux64": false,
        "isMac": false,
        "isBada": false,
        "isSamsung": false,
        "isRaspberry": false,
        "isBot": false,
        "isCurl": false,
        "isAndroidTablet": false,
        "isWinJs": false,
        "Browser": "unknown",
        "OS": "unknown",
        "Platform": "unknown",
        "source": ""
    },
    "namespace": "testapp"
}
```
#(Admin) Experiment
### create
##### post /api/testapp/experiments
```js
// req
{
    "name": "expTest",
    "values": [
        "red",
        "green",
        "blue",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
    ]
}
```
```js
// res
{
    "namespace": "testapp",
    "name": "expTest",
    "values": [
        "red",
        "green",
        "blue",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
    ]
}
```
### get
##### get /api/testapp/experiments
```js
// req

```
```js
// res
[
    {
        "namespace": "testapp",
        "name": "expTest",
        "values": [
            "red",
            "green",
            "blue",
            "a",
            "b",
            "c",
            "d",
            "e",
            "f"
        ]
    }
]
```
### remove
##### delete /api/testapp/experiments/expTest
```js
// req

```
```js
// res
{
    "success": true
}
```
### results
##### get /api/testapp/experiments/dingdong/results?from=1/1/14&to=1/3/14&split=Platform,Browser&conversion=ding
```js
// req

```
```js
// res
[
    {
        "test": "a",
        "participantCount": 1,
        "splits": {
            "Platform": "Apple Mac",
            "Browser": "Chrome"
        },
        "data": [
            {
                "count": 1,
                "timestamp": "2014-01-01T08:00:00.000Z"
            },
            {
                "count": 1,
                "timestamp": "2014-01-02T08:00:00.000Z"
            },
            {
                "count": 2,
                "timestamp": "2014-01-03T08:00:00.000Z"
            }
        ]
    },
    {
        "test": "b",
        "participantCount": 1,
        "splits": {
            "Platform": "Linux",
            "Browser": "Chrome"
        },
        "data": [
            {
                "count": 2,
                "timestamp": "2014-01-01T08:00:00.000Z"
            },
            {
                "count": 1,
                "timestamp": "2014-01-02T08:00:00.000Z"
            },
            {
                "count": 1,
                "timestamp": "2014-01-03T08:00:00.000Z"
            }
        ]
    },
    {
        "test": "a",
        "participantCount": 1,
        "splits": {
            "Platform": "Linux",
            "Browser": "Chrome"
        },
        "data": [
            {
                "count": 2,
                "timestamp": "2014-01-01T08:00:00.000Z"
            },
            {
                "count": 1,
                "timestamp": "2014-01-03T08:00:00.000Z"
            }
        ]
    }
]
```