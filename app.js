// Import SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getDatabase,ref,set,push,orderByChild ,query,equalTo,onValue } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyDBgD1jR76nCCic0a_zZohymSc5Ga1BqDU",
authDomain: "chat-app-d2d78.firebaseapp.com",
projectId: "chat-app-d2d78",
storageBucket: "chat-app-d2d78.appspot.com",
messagingSenderId: "741253664851",
appId: "1:741253664851:web:47f92b79bcec0e2f38f6a6"
};

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize auth
const auth = getAuth(app);

// Initilize database
const database = getDatabase(app);



// Change username as email

$(document).ready(function(){
  onAuthStateChanged(auth, (user) => {
    $(".username").text(user.email)
  
  })  
})


// sign out the user

$(document).ready(function(){
  $("#signOut").click(function(){
    signOut(auth)
    .then(() => {
    // Sign out successful
      console.log("user successfully logged out")
      window.location.href = "index.html"
    })
    .catch((error) => {
    // An error happened
    });
  })
})


// register user

$(document).ready(function() {
  $("#register").submit(function(event) {
    event.preventDefault(); // prevent the form from submitting
     // Get form values
    const email = $("#email").val();
    const password = $("#floatingPassword").val();
    
     // Create a new user with email and password
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // User created successfully
        console.log("User created",userCredential);
        window.location.href = "index.html"

      })
    .catch((error) => {
    // Handle errors
      console.log(error);
      alert(error)

    });
    
  });
});


// sign in user

$(document).ready(function() {
  $("#login").submit(function(event) {
    event.preventDefault(); // prevent the form from submitting
    
     // Get form values
    const email = $("#email").val();
    const password = $("#floatingPassword").val();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
        console.log("User found ", user);
        window.location.href = "home.html"
        this.reset();
    })
    .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
      alert(errorMessage);
    });
  });
});



// function to create a new blog post

function writeBlogData(userId, genre , title , description, blogContent,dateTime) {
  
  const blogPostsRef = ref(database, 'blogPosts');

  const newBlogPost = {
    genre: genre,
    title: title,
    description: description,
    userId: userId,
    blogContent : blogContent,
    dateTime : dateTime
  }

  // Add the new blog post to the database using the push method
  push(blogPostsRef, newBlogPost)
  .then(() => {
    console.log("New blog post added successfully!");
    window.location.href = "home.html"
  })
  .catch((error) => {
    console.error("Error adding new blog post: ", error);
  });

}


// write blog

$(document).ready(function() {
  $('#blog').submit(function(event) {
    event.preventDefault(); // Prevent the form from submitting

    
    // Get the input field values
    const genre = $('#genre').val();
    const title = $('#title').val();
    const blogcontent = $('#blogcontent').val();
    const description = $('#description').val();

    const dateTime = new Date().toLocaleString();

    onAuthStateChanged(auth, (user) => {
      if(user){
        // call writeBlogData() to create a new blog post
        writeBlogData(user.uid,genre,title,description,blogcontent,dateTime);
      }else{
        window.location.href = "index.html";
      }
    });

  })

})




// list current user blogs

onAuthStateChanged(auth, (user) => {
  if(user){
    const blogsRef = ref(database, 'blogPosts');

    const userBlogsRef = query(blogsRef, orderByChild("userId"), equalTo(user.uid));

    
    onValue(userBlogsRef, (snapshot) => {
      // handle snapshot data here

      const currentUserBlogs = snapshot.val();

      const blogPostsArray = Object.keys(currentUserBlogs).map(key => {
        return { id: key, ...currentUserBlogs[key] };
      });
    
      const $blogPostsContainer = $('#myblog-container');
      
      // create blog card and append it ti myblog-container div
    
      blogPostsArray.forEach((post) => {
        const $post = $('<div>').attr("id","post").addClass('col p-4 d-flex flex-column position-static');
        $post.append($('<strong>').addClass('d-inline-block mb-2 text-primary').text(post.genre));
        $post.append($('<h3>').addClass('mb-0').text(post.title));
        $post.append($('<div>').addClass('mb-1 text-muted').text(post.dateTime));
        $post.append($('<p>').addClass('card-text mb-auto').text(post.description));
        $post.append($('<a>').attr('href', '#').addClass('stretched-link').text('Continue reading'));
      
        const $imageContainer = $('<div>').addClass('col-auto d-none d-lg-block');
    
        $imageContainer.append($('<img>').attr({
          'src': "https://res.cloudinary.com/dk-find-out/image/upload/q_80,w_1920,f_auto/95018348_ild9h6.jpg",
          'width': '200',
          'height': '200'
        }))
    
        $blogPostsContainer.append($('<div>').addClass('row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative').append($post).append($imageContainer));
      });
      
    
      console.log(blogPostsArray)


      // console.log(data)
    }, (error) => {
      // handle error here
    }); 


  }else{
    console.log("User not found")
  }
});






// List all users blogs

const blogPostsRef = ref(database, 'blogPosts');

onValue(blogPostsRef, (snapshot) => {
  const blogPosts = snapshot.val();
// Convert object to array
  const blogPostsArray = Object.keys(blogPosts).map(key => {
    return { id: key, ...blogPosts[key] };
  });

  const $blogPostsContainer = $('#blog-posts-container');

  // create all user blog card

  blogPostsArray.forEach((post) => {
    const $post = $('<div>').addClass('col p-4 d-flex flex-column position-static');
    $post.append($('<strong>').addClass('d-inline-block mb-2 text-primary').text(post.genre));
    $post.append($('<h3>').addClass('mb-0').text(post.title));
    $post.append($('<div>').addClass('mb-1 text-muted').text(post.dateTime));
    $post.append($('<p>').addClass('card-text mb-auto').text(post.description));
    $post.append($('<a>').attr('href', '#').addClass('stretched-link').text('Continue reading'));
  
    const $imageContainer = $('<div>').addClass('col-auto d-none d-lg-block');
    // <img src="https://res.cloudinary.com/dk-find-out/image/upload/q_80,w_1920,f_auto/95018348_ild9h6.jpg" width="200" height="200">

    $imageContainer.append($('<img>').attr({
      'src': "https://res.cloudinary.com/dk-find-out/image/upload/q_80,w_1920,f_auto/95018348_ild9h6.jpg",
      'width': '200',
      'height': '200'
    }))

    $blogPostsContainer.append($('<div>').attr("id","post").addClass('row g-0 border rounded overflow-hidden flex-md-row mb-4 shadow-sm h-md-250 position-relative').append($post).append($imageContainer));
  
  
    $post.find('.stretched-link').on('click', function(event) {
      event.preventDefault(); 
      // To view single blog content
      blogContent(post)
      
    });
    console.log(blogPostsArray)
  
  });
  

  
}, (error) => {
  console.error(error);

});






// View blog post

function blogContent(post){
  console.log(" i am here ",post);
  const data = JSON.stringify(post)
  // pass blog data as params
  const url = `blog.html?data=${data}`;  
  window.location.href = url;
}


  



