/* Admin login page — redirects if no session */
(function(){
  if (sessionStorage.getItem('adminAuth') === 'true') {
    window.location.href = 'index.html';
  }
})();
