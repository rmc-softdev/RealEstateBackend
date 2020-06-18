## About this app
This is my master project. It was entirely designed by me, but its true strength lies in the code. With a clean design pattern, it is truly scalable. To do so, it's really a matter of time and effort, the structure is all here, for I have left lots of reusable components, you may want to open the UUI Elements folder (but not only) to understand the sheer force behind this statement. It took quite some time and effort to build such structure, but I finally decided to release it.

## Live demo at https://snug-homes.web.app

## How to run it

Simply type consecutively:

### `npm i`
### `npm start`

>> In both the FRONT END folder and the BACK END folder. You can find the BACK END folder here: https://github.com/rmc-softdev/RealEstateBackend

## Technical comments

One of the strong points of this project is, as I foresaid, the file structure and the scalability by chosing a clean design pattern and choosing, whenever possible,
to make reusable components. This was done, even in the backend, by the aid of customizable functions, we have, for example, a general Http Error which makes very easy to deal both in the back and the front end.


## Issues
One of the things I wish I could've done better was the handling of the geolocations of the rentals in the DB. I was unable to create a specific collection inside our main cluster to hold our such positions, I still think it would've made my life much easier and also it would be more scalable to do so, due to perfomance issues in larger apps.
