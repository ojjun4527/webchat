$(document).ready(function() {
    $("input").on("input", function() {
        checkInputFields();
    });

    let isDuplicatedChecked1 = false;
    let isDuplicatedChecked2 = false;

    $("#id-check").click(function() {
        overlapIDCheck();
    });

    $("#nickname-check").click(function() {
        overlapNicknameCheck();
    });

    function checkInputFields() {
        var password = $('#password').val();
        var passwordCheck = $('#password-check').val();
        var passwordMessage = $('#password-message')
        var submitButton = $('button[type="submit"]')

        var id = $('#id').val();
        var nickname = $('#nickname').val();

        var inputID = $('#id');

        /*입력값 확인*/
        if (password == "" || passwordCheck == ""){
            passwordMessage.text('');
        }
        else if (password !== passwordCheck) {
            passwordMessage.text('비밀번호가 일치하지 않습니다').css('color', 'red');
        } 
        else {
            passwordMessage.text('비밀번호가 일치합니다').css('color', 'green');
        }

        /*버튼 활성화*/
        if (password !== "" && passwordCheck !== "" && password === passwordCheck && id !== "" && nickname !== "" && isDuplicatedChecked1 && isDuplicatedChecked2) {
            submitButton.prop('disabled', false);
        }
        else {
            submitButton.prop('disabled', true);
        }
    }

    function overlapIDCheck() {
        $.post('/overlapIDCheck', {ID : $('#id').val()}, function(data) {
            var idMessage = $('#id-message');
            isDuplicatedChecked1 = data.available;


            if (data.available) {
                idMessage.text('사용 가능한 ID 입니다').css('color', 'green');
                if (confirm('사용 가능한 ID 입니다. 사용하시겠습니까?')) {
                    $('#id').prop('readonly', true);
                }
            } else {
                idMessage.text('이미 사용 중인 ID입니다').css('color', 'red');
            }
            checkInputFields();
        })
    }
    function overlapNicknameCheck() {
        $.post('/overlapNicknameCheck', {Nickname : $('#nickname').val()}, function(data) {
            var idMessage = $('#nickname-message');
            isDuplicatedChecked2 = data.available;

            if (data.available) {
                idMessage.text('사용 가능한 닉네임 입니다').css('color', 'green');
                if (confirm('사용 가능한 닉네임 입니다. 사용하시겠습니까?')) {
                    $('#nickname').prop('readonly', true);
                }
            } else {
                idMessage.text('이미 사용 중인 닉네임입니다').css('color', 'red');
            }
            checkInputFields();
        })
    }

});