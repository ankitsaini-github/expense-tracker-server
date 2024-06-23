exports.getpasswordpage=(id)=>{
  return (`
    <!DOCTYPE html>
<html>

  <head>
    <title>Password Reset</title>
    <script src="https://cdn.tailwindcss.com"></script>

  </head>

  <body>
    <div class="font-sans antialiased">
      <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-zinc-900">
        <div>
          <img src="https://i.imgur.com/XAQWwQd.png" alt="DhanDiary" width="300px" height="100px">
        </div>

        <div class="w-full sm:max-w-md mt-6 px-5 py-2 bg-zinc-800 shadow-lg overflow-hidden sm:rounded-lg">
          <form action="http://localhost:3000/user/reset-password/${id}" method="POST" enctype="application/x-www-form-urlencoded" class="py-5">

            <div class="py-3">
              <center>
                <span class="text-2xl font-semibold text-lime-400">New Password</span>
              </center>
            </div>

            <div class="mt-4">
              <label class="block font-medium text-sm text-gray-700" for="password" value="password" />
              <div class="relative">
                <input id="password" type="password" name="password" placeholder="New Password" required autocomplete="current-password" class='w-full text-zinc-300 text-lg p-2 rounded bg-zinc-900 border-2 border-transparent focus:outline-none focus:ring-0 focus:border-lime-500'>

                <div class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <button type="button" id="togglePassword" class="text-gray-500 focus:outline-none focus:text-gray-600 hover:text-gray-600">
                    👁️
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-center mt-4">

              <button class='px-5 py-2 rounded bg-lime-500 hover:bg-lime-600 text-lg font-semibold' type="submit" >
                UPDATE PASSWORD
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
		<script>
        const passwordInput = document.getElementById('password');
        const togglePasswordButton = document.getElementById('togglePassword');

        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
        });
    </script> 
  </body>

</html>
    `)
}