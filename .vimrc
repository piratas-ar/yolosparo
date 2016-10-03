set tabstop=2
set shiftwidth=2
set expandtab
let b:syntastic_javascript_eslint_exec = StrTrim(system('npm-which eslint'))
let g:syntastic_javascript_checkers = ['eslint']
