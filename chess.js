const board = document.querySelector('.board');
let box_color = 'whitesmoke';
let sug_used = [];
let turn = 'white';
let resurection_pos = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56],
    king_on_check = false,
    check_action = false,
    checckmate = false,
danger_zone = [],
king_position;



for (let i = 0; i < 64; i++) {

    let chess_box = document.createElement('div');
    chess_box.setAttribute('class', i);
    chess_box.innerHTML = i;
    if (box_color == 'whitesmoke') {
        chess_box.style.backgroundColor = box_color;
        box_color = 'grey'
        if (i % 8 == 0 && i > 0) {
            chess_box.style.backgroundColor = 'grey';
            box_color = 'whitesmoke';
        }

    } else if (box_color == 'grey') {
        chess_box.style.backgroundColor = box_color;
        box_color = 'whitesmoke'
        if (i % 8 == 0 && i > 0) {
            chess_box.style.backgroundColor = 'whitesmoke';
            box_color = 'grey';

        }
    }
    board.appendChild(chess_box);

}
localStorage.getItem('check_play') == undefined ? localStorage.setItem('check_play', JSON.stringify({ plays: [] })) : null;
// Fill board with caracters
const boxes = document.querySelectorAll('.board div');



function fill_board() {

    if (localStorage.getItem('gameplay') == undefined) {
        // White Characters
        boxes[0].innerHTML = "<img src='img/rook-w.png'>";
        boxes[1].innerHTML = '<img src="img/knight-w.png">';
        boxes[2].innerHTML = '<img src="img/bishop-w.png">';
        boxes[3].innerHTML = '<img src="img/king-w.png">';
        boxes[4].innerHTML = '<img src="img/queen-w.png">';
        boxes[5].innerHTML = '<img src="img/bishop-w.png">';
        boxes[6].innerHTML = '<img src="img/knight-w.png">';
        boxes[7].innerHTML = '<img src="img/rook-w.png">';
        boxes[8].innerHTML = '<img src="img/pawn-w.png">';
        boxes[9].innerHTML = '<img src="img/pawn-w.png">';
        boxes[10].innerHTML = '<img src="img/pawn-w.png">';
        boxes[11].innerHTML = '<img src="img/pawn-w.png">';
        boxes[12].innerHTML = '<img src="img/pawn-w.png">';
        boxes[13].innerHTML = '<img src="img/pawn-w.png">';
        boxes[14].innerHTML = '<img src="img/pawn-w.png">';
        boxes[15].innerHTML = '<img src="img/pawn-w.png">';

        // Black Characters
        boxes[63].innerHTML = '<img src="img/rook-b.png">';
        boxes[62].innerHTML = '<img src="img/knight-b.png">';
        boxes[61].innerHTML = '<img src="img/bishop-b.png">';
        boxes[60].innerHTML = '<img src="img/queen-b.png">';
        boxes[59].innerHTML = '<img src="img/king-b.png">';
        boxes[58].innerHTML = '<img src="img/bishop-b.png">';
        boxes[57].innerHTML = '<img src="img/knight-b.png">';
        boxes[56].innerHTML = '<img src="img/rook-b.png">';
        boxes[55].innerHTML = '<img src="img/pawn-b.png">';
        boxes[54].innerHTML = '<img src="img/pawn-b.png">';
        boxes[53].innerHTML = '<img src="img/pawn-b.png">';
        boxes[52].innerHTML = '<img src="img/pawn-b.png">';
        boxes[51].innerHTML = '<img src="img/pawn-b.png">';
        boxes[50].innerHTML = '<img src="img/pawn-b.png">';
        boxes[49].innerHTML = '<img src="img/pawn-b.png">';
        boxes[48].innerHTML = '<img src="img/pawn-b.png">';

        // Save Gameplay
        king_position=3;
        save_gameplay();

    } else if (JSON.parse(localStorage.getItem('gameplay'))) {
        let character_location = JSON.parse(localStorage.getItem('gameplay')).locations;
        turn = localStorage.getItem('turn');

        boxes.forEach((each, index) => {
            each.innerHTML = character_location[index];
            // each.innerHTML = index;
        })
        const key = turn=='white' ? 'w' : 'b'; 
        king_position = character_location.indexOf(`<img src="img/king-${key}.png">`)
        save_gameplay();
    }
    
}
fill_board();
ressurect_pawn();

function ressurect_pawn() {
    boxes.forEach((each, index) => {
        if (resurection_pos.includes(index)) {

            if (each.innerHTML == '<img src="img/pawn-b.png">') {
                each.innerHTML = '<img src="img/queen-b.png">'
            } else if (each.innerHTML == '<img src="img/pawn-w.png">') {
                each.innerHTML = '<img src="img/queen-w.png">'
            }
        }

    })
}

function save_gameplay() {
    let character_location = [];
    boxes.forEach(each => {
        character_location.push(each.innerHTML);
    })
    localStorage.setItem('gameplay', JSON.stringify({ locations: character_location }));
    localStorage.setItem('turn', turn);
    localStorage.setItem('king_position', king_position);
    

};

function gameplay() {
   
    //  Label Boxes with caharacters
 
    boxes.forEach((each, index) => {
        if (each.children.length > 0) {
            let keys = each.children[0].getAttribute('src').split('/')[1].split('.')[0].split('-');
            // console.log(keys);
            let color = (keys[1] == 'b') ? 'black' : "white"
            each.setAttribute('data-color', color);
            each.setAttribute('data-character', keys[0]);
        }
        each.addEventListener('click', () => {

            if (each.getAttribute('data-color') === turn) {
                move_character(each);
            }

        })
    })


}

function move_character(character) {
    let side = character.getAttribute('data-color'),
        position = parseInt(character.getAttribute('class')),
        character_type = character.getAttribute('data-character'),
        suggestion_array = [],
        isLeft = [0, 8, 16, 24, 32, 40, 48, 56].includes(position),
        isRight = [7, 15, 23, 31, 39, 47, 55, 63].includes(position),
        first_pawn_positon_black = [49, 50, 51, 52, 53, 54, 55].includes(position),
        first_pawn_positon_white = [8, 9, 10, 11, 12, 13, 14, 15].includes(position),
        black_pawn_at_opposite_end = [8, 9, 10, 11, 12, 13, 14, 15].includes(position),
        white_pawn_at_opposite_end = [48, 49, 50, 51, 52, 53, 54, 55].includes(position),
        black_pawn_resurect = [0, 1, 2, 3, 4, 5, 6, 7].includes(position),
        knight_a_box_toleft = [1, 9, 17, 25, 33, 41, 49, 57].includes(position),
        knight_a_box_toright = [6, 14, 22, 30, 38, 46, 54, 62].includes(position),
        atBottom = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56].includes(position);





    if (side == turn) {
        switch (character_type) {
            case "pawn":
                move_pawn();
                break;
            case "king":
                move_king(position);
                break;
            case "queen":
                move_queen();
                break;
            case "rook":
                move_rook();
                break;
            case "bishop":
                move_bishop();
                break;
            case "knight":
                move_knight();
                break;
        }



        // Pawn Character Routine
        function move_pawn() {
            suggestion_array = [];

            remove_suggestion();
            // Pawn at the left of the board
            if (isLeft && side == 'black') {
                // Double step
                if (first_pawn_positon_black && boxes[position - 16].children.length == 0) {
                    // alert('double step')

                    suggestion_array.push({ original_position: position, move_to: position - 16, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })

                }


                if (boxes[position - 7].children.length != 0 && boxes[position - 7].getAttribute("data-color") != side) {
                    suggestion_array.push({ original_position: position, move_to: position - 7, character_type: character_type, side: side })

                    danger_zone.push(position - 7);
                }
                if (boxes[position - 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })
                    danger_zone.push(position - 8);
                }

            } else if (isLeft && side == 'white') {
                // Double step
                if (first_pawn_positon_white && boxes[position + 16].children.length == 0) {

                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position + 16, character_type: character_type, side: side })
                    danger_zone.push(position + 8);
                    danger_zone.push(position + 16);
                }
                if (boxes[position + 9].children.length != 0 && boxes[position + 9].getAttribute("data-color") != side) {
                    suggestion_array.push({ original_position: position, move_to: position + 9, character_type: character_type, side: side })
                    danger_zone.push(position + 9);
                }
                if (boxes[position + 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                    danger_zone.push(position + 8);
                }
                // Pawn at the right of the board
            } else if (isRight && side == 'black') {
                // Double step
                if (first_pawn_positon_black && boxes[position - 16].children.length == 0) {

                    suggestion_array.push({ original_position: position, move_to: position - 16, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })
                    danger_zone.push(position - 16);
                    danger_zone.push(position - 8);
                }
                if (boxes[position - 9].children.length != 0 && boxes[position - 9].getAttribute("data-color") != side) {
                    suggestion_array.push({ original_position: position, move_to: position - 9, character_type: character_type, side: side })
                    danger_zone.push(position - 9);
                }
                if (boxes[position - 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })
                    danger_zone.push(position - 8);
                }
            } else if (isRight && side == 'white') {
                // Double step
                if (first_pawn_positon_white && boxes[position + 16].children.length == 0) {

                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position + 16, character_type: character_type, side: side })
                    danger_zone.push(position + 8);
                    danger_zone.push(position + 16);
                }
                if (boxes[position + 7].children.length != 0 && boxes[position + 7].getAttribute("data-color") != side) {
                    suggestion_array.push({ original_position: position, move_to: position + 7, character_type: character_type, side: side })
                    danger_zone.push(position + 7);
                }
                if (boxes[position + 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                    danger_zone.push(position + 8);
                }
            } else if (!isLeft && !isRight) {
                // Double step
                if (first_pawn_positon_black && side == 'black' && boxes[position - 16].children.length == 0 && boxes[position - 16] != undefined && boxes[position - 8].children.length == 0) {

                    suggestion_array.push({ original_position: position, move_to: position - 16, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })
                    danger_zone.push(position - 16);
                    danger_zone.push(position - 8);
                }
                if (first_pawn_positon_white && side == 'white' && boxes[position + 16].children.length == 0 && boxes[position + 8].children.length == 0) {

                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                    suggestion_array.push({ original_position: position, move_to: position + 16, character_type: character_type, side: side })
                    danger_zone.push(position + 8);
                    danger_zone.push(position + 16);
                }
                if (side == 'black') {
                    if (boxes[position - 9] != undefined) {
                        if (boxes[position - 9].children.length != 0 && boxes[position - 9].getAttribute("data-color") != side) {
                            suggestion_array.push({ original_position: position, move_to: position - 9, character_type: character_type, side: side })
                            danger_zone.push(position - 9);
                        }
                    }
                    if (boxes[position - 8] != undefined) {
                        if (boxes[position - 8].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side })
                            danger_zone.push(position - 8);
                        }
                    }
                    if (boxes[position - 7] != undefined) {
                        if (boxes[position - 7].children.length != 0 && boxes[position - 7].getAttribute("data-color") != side) {
                            suggestion_array.push({ original_position: position, move_to: position - 7, character_type: character_type, side: side })
                            danger_zone.push(position - 7);
                        }
                    }

                }
                if (side == 'white') {
                    // Double step
                    if (first_pawn_positon_white && boxes[position + 16].children.length == 0 && boxes[position + 8].children.length == 0) {

                        suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                        suggestion_array.push({ original_position: position, move_to: position + 16, character_type: character_type, side: side })
                        danger_zone.push(position + 8);
                        danger_zone.push(position + 16);
                    }
                    if (boxes[position + 7].children.length != 0 && boxes[position + 7].getAttribute("data-color") != side) {
                        suggestion_array.push({ original_position: position, move_to: position + 7, character_type: character_type, side: side })
                        danger_zone.push(position + 7);
                    }
                    if (boxes[position + 8].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side })
                        danger_zone.push(position + 8);
                    }
                    if (boxes[position + 9].children.length != 0 && boxes[position + 9].getAttribute("data-color") != side) {
                        suggestion_array.push({ original_position: position, move_to: position + 9, character_type: character_type, side: side })
                        danger_zone.push(position + 9);
                    }

                }

            } else if (black_pawn_at_opposite_end && side == 'black') {
                if (isRight && boxes[position - 9].children.length != 0 && boxes[position - 9].getAttribute('data-color') != side) {
                    suggestion_array.push({ original_position: position, move_to: position - 9, character_type: character_type, side: side });
                    danger_zone.push(position - 9);
                }
                if (boxes[position - 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side });
                    danger_zone.push(position - 8);
                }
                if (isLeft && boxes[position - 7].children.length != 0 && boxes[position - 7].getAttribute('data-color') != side) {
                    suggestion_array.push({ original_position: position, move_to: position - 7, character_type: character_type, side: side });
                    danger_zone.push(position - 7);
                }
                if (!isLeft && !isRight) {
                    if (boxes[position - 9].children.length != 0 && boxes[position - 9].getAttribute('data-color') != side) {
                        suggestion_array.push({ original_position: position, move_to: position - 9, character_type: character_type, side: side });
                        danger_zone.push(position - 9);
                    }
                    if (boxes[position - 8].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 8, character_type: character_type, side: side });
                        danger_zone.push(position - 8);
                    }
                    if (boxes[position - 7].children.length != 0 && boxes[position - 7].getAttribute('data-color') != side) {
                        suggestion_array.push({ original_position: position, move_to: position - 7, character_type: character_type, side: side });
                        danger_zone.push(position - 7);
                    }
                }
            } else if (white_pawn_at_opposite_end && side == 'white') {
                if (isRight && boxes[position + 7].children.length != 0 && boxes[position + 7].getAttribute('data-color') != side) {
                    suggestion_array.push({ original_position: position, move_to: position + 7, character_type: character_type, side: side });
                    danger_zone.push(position + 7);
                }
                if (boxes[position + 8].children.length == 0) {
                    suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side });
                    danger_zone.push(position + 8);
                }
                if (isLeft && boxes[position + 9].children.length != 0 && boxes[position + 9].getAttribute('data-color') != side) {
                    suggestion_array.push({ original_position: position, move_to: position + 9, character_type: character_type, side: side });
                    danger_zone.push(position + 9);
                }
                if (!isLeft && !isRight) {
                    if (boxes[position + 7].children.length != 0 && boxes[position + 7].getAttribute('data-color') != side) {
                        suggestion_array.push({ original_position: position, move_to: position + 7, character_type: character_type, side: side });
                        danger_zone.push(position + 7);
                    }
                    if (boxes[position + 8].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 8, character_type: character_type, side: side });
                        danger_zone.push(position + 8);
                    }
                    if (boxes[position + 9].children.length != 0 && boxes[position + 9].getAttribute('data-color') != side) {
                        suggestion_array.push({ original_position: position, move_to: position + 9, character_type: character_type, side: side });
                        danger_zone.push(position + 9);
                    }
                }
            }


            // Sort Suggestion Box
            suggestion_array.sort((a, b) => {
                return a.move_to - b.move_to;
            })

            let plays = JSON.parse(localStorage.getItem('check_play')).plays
            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < suggestion_array.length; i++) {
                if (ordered_array.includes(suggestion_array[i].move_to) == false) {
                    ordered_array.push(suggestion_array[i].move_to);
                    ordered_array2.push(suggestion_array[i]);

                }
            }


            suggestion_array = ordered_array2;
            console.log(suggestion_array);
            if(king_on_check){
               const _check_patterns = get_check_pattern();
               console.log(get_check_pattern());
               suggestion_array= suggestion_array.filter((each)=> _check_patterns.includes(each.move_to))
               suggestion_array.forEach((each, index) => {
                boxes[each.move_to].classList.add('sug');
                boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                danger_zone.push(each.move_to);
              

            })
            }else{
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);
    
                })
            }
           
            localStorage.setItem('check_play', JSON.stringify({ plays: plays }));
        }

        function remove_suggestion() {
            boxes.forEach(each => {
                each.classList.remove('sug');
            })
        }


        let suggestion_box = document.querySelectorAll('.sug');

        suggestion_box.forEach((each, index) => {

            let sug_obj = each.getAttribute('data-additional').split('-');
            console.log(sug_obj);

            each.addEventListener('click', () => {
                suggestion_array = [];
                if (each.classList.contains('sug')) {

                    character_action(parseInt(sug_obj[3]), parseInt(sug_obj[4]));
                    localStorage.setItem('last_played', JSON.stringify({ from: (sug_obj[3]), to: (sug_obj[4]) }))
                    remove_suggestion();
                    turn = (turn == "white") ? 'black' : 'white';
                    save_gameplay();
                    suggestion_array = [];
                    location.reload();emove



                }

            })
        })

        function character_action(initial_position, next_position) {
            boxes[initial_position].innerHTML = initial_position;
            boxes[initial_position].removeAttribute('data-character');
            boxes[initial_position].removeAttribute('data-color');
            let color_key = (turn == 'white') ? 'w' : 'b',
                pawn_color = color_key == 'w' ? 'white' : 'black';

            boxes[next_position].innerHTML = `<img src='img/${character_type}-${color_key}.png'>`;
            boxes[next_position].setAttribute('data-color', pawn_color);
            boxes[next_position].setAttribute('data-character', character_type);
        }
        // End of pawn Routine


        // Knight Routine


        function move_knight() {
            let suggestion_array = [];
            remove_suggestion();
            if (!isLeft && !isRight && !knight_a_box_toleft && !knight_a_box_toright) {
                if (boxes[position + 17] != undefined) {
                    if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                        danger_zone.push(position + 17);
                    }
                }
                if (boxes[position + 15] != undefined) {
                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                        danger_zone.push(position + 15);
                    }
                }
                if (boxes[position + 6] != undefined) {
                    if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != turn || boxes[position + 6].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 6, character_type: character_type, side: side });
                        danger_zone.push(position + 6);
                    }
                }
                if (boxes[position + 10] != undefined) {
                    if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != turn || boxes[position + 10].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 10, character_type: character_type, side: side });
                        danger_zone.push(position + 10);
                    }
                }
                if (boxes[position - 17] != undefined) {
                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                        danger_zone.push(position - 17);
                    }
                }
                if (boxes[position - 15] != undefined) {
                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                        danger_zone.push(position - 15);
                    }
                }
                if (boxes[position - 6] != undefined) {
                    if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != turn || boxes[position - 6].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 6, character_type: character_type, side: side });
                        danger_zone.push(position - 6);
                    }
                }
                if (boxes[position - 10] != undefined) {
                    if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != turn || boxes[position - 10].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 10, character_type: character_type, side: side });
                        danger_zone.push(position - 10);
                    }
                }
            } else if (knight_a_box_toleft) {
                if (boxes[position - 17] != undefined) {
                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                        danger_zone.push(position - 17);
                    }
                }
                if (boxes[position - 15] != undefined) {
                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                        danger_zone.push(position - 15);
                    }
                }
                if (boxes[position - 6] != undefined) {
                    if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != turn || boxes[position - 6].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position - 6, character_type: character_type, side: side });
                        danger_zone.push(position - 6);
                    }
                }
                if (boxes[position + 17] != undefined) {
                    if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                        danger_zone.push(position + 17);
                    }
                }
                if (boxes[position + 15] != undefined) {
                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                        danger_zone.push(position + 15);
                    }
                }

                if (boxes[position + 10] != undefined) {
                    if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != turn || boxes[position + 10].children.length == 0) {
                        suggestion_array.push({ original_position: position, move_to: position + 10, character_type: character_type, side: side });
                        danger_zone.push(position + 10);
                    }

                }

            } else if (knight_a_box_toright) {
                if (!atBottom) {
                    if (boxes[position - 17] != undefined) {
                        if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                            danger_zone.push(position - 17);
                        }
                    }
                    if (boxes[position - 15] != undefined) {
                        if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                            danger_zone.push(position - 15);
                        }
                    }
                    if (boxes[position - 10] != undefined) {
                        if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != turn || boxes[position - 10].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 10, character_type: character_type, side: side });
                            danger_zone.push(position - 10);
                        }
                    }
                    if (boxes[position + 17] != undefined) {
                        if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                            danger_zone.push(position + 17);
                        }
                    }
                    if (boxes[position + 15] != undefined) {
                        if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                        }
                    }
                    if (boxes[position + 6] != undefined) {
                        if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != turn || boxes[position + 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 6, character_type: character_type, side: side });
                            danger_zone.push(position + 6);
                        }
                    }

                }

                if (atBottom) {
                    if (boxes[position + 17] != undefined) {
                        if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                            danger_zone.push(position + 17);
                        }
                    }
                    if (boxes[position + 15] != undefined) {
                        if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                            danger_zone.push(position + 15);
                        }
                    }
                    if (boxes[position + 6] != undefined) {
                        if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != turn || boxes[position + 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 6, character_type: character_type, side: side });
                            danger_zone.push(position + 6);
                        }
                    }
                    if (boxes[position - 17] != undefined) {
                        if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                            danger_zone.push(position - 17);
                        }
                    }
                    if (boxes[position - 15] != undefined) {
                        if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                            danger_zone.push(position - 15);
                        }
                    }
                    if (boxes[position - 6] != undefined) {
                        if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != turn || boxes[position - 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 6, character_type: character_type, side: side });
                            danger_zone.push(position - 6);
                        }
                    }
                    if (boxes[position - 10] != undefined) {
                        if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != turn || boxes[position - 10].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 10, character_type: character_type, side: side });
                            danger_zone.push(position - 10);
                        }
                    }
                }
            } else if (isLeft) {
                if (!atBottom) {
                    if (boxes[position + 17] != undefined) {
                        if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                            danger_zone.push(position + 17);
                        }
                    }
                    if (boxes[position - 15] != undefined) {
                        if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                            danger_zone.push(position - 15);
                        }
                    }
                    if (boxes[position + 10] != undefined) {
                        if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != turn || boxes[position + 10].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 10, character_type: character_type, side: side });
                            danger_zone.push(position + 10);
                        }
                    }
                    if (boxes[position - 6] != undefined) {
                        if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != turn || boxes[position - 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 6, character_type: character_type, side: side });
                            danger_zone.push(position - 6);
                        }
                    }
                } else {
                    if (boxes[position - 15] != undefined) {
                        if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != turn || boxes[position - 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 15, character_type: character_type, side: side });
                            danger_zone.push(position - 15);
                        }
                    }
                    if (boxes[position - 6] != undefined) {
                        if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != turn || boxes[position - 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 6, character_type: character_type, side: side });
                            danger_zone.push(position - 6);
                        }
                    }
                    if (side == 'white') {
                        if (boxes[position + 10] != undefined) {
                            if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != turn || boxes[position + 10].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: position + 10, character_type: character_type, side: side });
                                danger_zone.push(position + 10);
                            }
                        }
                        if (boxes[position + 17] != undefined) {
                            if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != turn || boxes[position + 17].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: position + 17, character_type: character_type, side: side });
                                danger_zone.push(position + 17);
                            }
                        }
                    }
                }
            } else if (isRight) {
                if (atBottom) {
                    if (boxes[position - 17] != undefined) {
                        if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                            danger_zone.push(position - 17);
                        }
                    }
                    if (boxes[position - 10] != undefined) {
                        if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != turn || boxes[position - 10].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 10, character_type: character_type, side: side });
                            danger_zone.push(position - 10);
                        }
                    }

                    if (boxes[position + 6] != undefined) {
                        if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != turn || boxes[position + 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 6, character_type: character_type, side: side });
                            danger_zone.push(position + 6);
                        }
                    }
                    if (boxes[position + 15] != undefined) {
                        if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                            danger_zone.push(position + 15);
                        }
                    }

                } else {
                    if (boxes[position - 17] != undefined) {
                        if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != turn || boxes[position - 17].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 17, character_type: character_type, side: side });
                            danger_zone.push(position - 17);
                        }
                    }
                    if (boxes[position + 15] != undefined) {
                        if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != turn || boxes[position + 15].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 15, character_type: character_type, side: side });
                            danger_zone.push(position + 15);
                        }
                    }
                    if (boxes[position - 10] != undefined) {
                        if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != turn || boxes[position - 10].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position - 10, character_type: character_type, side: side });
                            danger_zone.push(position - 10);
                        }
                    }

                    if (boxes[position + 6] != undefined) {
                        if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != turn || boxes[position + 6].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: position + 6, character_type: character_type, side: side });
                            danger_zone.push(position + 6);
                        }
                    }
                }
            }



            // Sort Suggestion Box
            suggestion_array.sort((a, b) => {
                return a.move_to - b.move_to;
            })

            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < suggestion_array.length; i++) {
                if (ordered_array.includes(suggestion_array[i].move_to) == false) {
                    ordered_array.push(suggestion_array[i].move_to);
                    ordered_array2.push(suggestion_array[i]);
                }
            }

            suggestion_array = ordered_array2;
            console.log(suggestion_array);
            if (king_on_check) {
                const _check_patterns = get_check_pattern();
                suggestion_array= suggestion_array.filter((each)=> _check_patterns.includes(each.move_to))
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);

                })
            } else {
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);

                })
            }
           
        }


        // End of Knight Routine


        // Rook Routine

        function move_rook() {
            remove_suggestion();
            //    Move vertically Upward
            for (i = position; i < 64; i += 8) {
                if (i > position) {
                    if (boxes[i] != undefined) {
                        if (boxes[i].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);

                        } else if (boxes[i].getAttribute('data-color') != turn) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i)
                            break;
                        } else {
                            break;
                        }

                    }
                }
            }
            //    Move vertically Downward
            for (i = position; i >= i - (Math.floor(i / 8) * 8); i -= 8) {
                if (i < position) {
                    if (boxes[i] != undefined) {
                        if (boxes[i].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);
                        } else if (boxes[i].getAttribute('data-color') != turn) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);
                            break;
                        } else {
                            break;
                        }

                    }
                }
            }

            //    Move Horizontally Forward
            for (i = position; i <= (8 * Math.floor(position / 8)) + 7; i++) {

                if (i > position) {
                    if (boxes[i] != undefined) {
                        if (boxes[i].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);

                        } else if (boxes[i].getAttribute('data-color') != turn) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);
                            break;
                        } else {
                            break;
                        }

                    }
                }
            }
            //    Move Horizontally Backward
            for (i = position; i >= 8 * Math.floor(position / 8); i--) {

                if (i < position) {
                    if (boxes[i] != undefined) {
                        if (boxes[i].children.length == 0) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);

                        } else if (boxes[i].getAttribute('data-color') != turn) {
                            suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                            danger_zone.push(i);
                            break;
                        } else {
                            break;
                        }


                    }
                }
            }

            // Sort Suggestion Box
            suggestion_array.sort((a, b) => {
                return a.move_to - b.move_to;
            })

            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < suggestion_array.length; i++) {
                if (ordered_array.includes(suggestion_array[i].move_to) == false) {
                    ordered_array.push(suggestion_array[i].move_to);
                    ordered_array2.push(suggestion_array[i]);
                }
            }

            suggestion_array = ordered_array2;
            console.log(suggestion_array);
            
            if (king_on_check) {
                const _check_patterns = get_check_pattern();
                suggestion_array= suggestion_array.filter((each)=> _check_patterns.includes(each.move_to));
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);
                })
                
            } else {
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);
                })
            }
          

        }


        // End of rook Routine


        // Bishop Routine
        function move_bishop() {
            remove_suggestion();
            let boundaries = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56, 0, 8, 16, 24, 32, 40, 48, 56,
                    7, 15, 23, 31, 39, 47, 55, 63
                ],
                bottom_pos = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56];

            if (!isLeft && !isRight) {
                // Move Diagonally to the right
                move_diagonally_right();
                // Move Diagonally to the left
                move_diagonally_left();
                // Move Diagonally backward
                move_diagonally_backward_left();
                move_diagonally_backward_right();


            } else if (isRight) {
                move_diagonally_right();
                move_diagonally_backward_right();
            } else if (isLeft) {
                move_diagonally_left();
                move_diagonally_backward_left();
            }





            // Sort Suggestion Box
            suggestion_array.sort((a, b) => {
                return a.move_to - b.move_to;
            })

            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < suggestion_array.length; i++) {
                if (ordered_array.includes(suggestion_array[i].move_to) == false) {
                    ordered_array.push(suggestion_array[i].move_to);
                    ordered_array2.push(suggestion_array[i]);
                }
            }

            suggestion_array = ordered_array2;
            console.log(suggestion_array);
            
            if (king_on_check) {
                const _check_patterns = get_check_pattern();
                suggestion_array= suggestion_array.filter((each)=> _check_patterns.includes(each.move_to))
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);

                })
            } else {
                suggestion_array.forEach((each, index) => {
                    boxes[each.move_to].classList.add('sug');
                    boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                    boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                    danger_zone.push(each.move_to);
                })
            }
            function move_diagonally_right() {
                for (i = position; i <= position * 8; i += 7) {
                    if (i > position) {
                        if (boxes[i] != undefined) {
                            if (boxes[i].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });

                            } else if (boxes[i].getAttribute('data-color') != turn) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                break;
                            } else {
                                break;
                            }

                        }
                    }
                }
            }

            function move_diagonally_left() {

                for (i = position; i < 64; i += 9) {

                    if (i > position) {
                        if (boxes[i] != undefined) {
                            if (boxes[i].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);

                            } else if (boxes[i].getAttribute('data-color') != turn) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);
                                break;
                            } else {
                                break;
                            }

                        }
                    }
                    if (boundaries.includes(i) && position != i) {
                        break;
                    }
                }
            }

            function move_diagonally_backward_right() {
                for (i = position; i > 0; i -= 9) {

                    if (i < position) {
                        if (boxes[i] != undefined) {
                            if (boxes[i].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);

                            } else if (boxes[i].getAttribute('data-color') != turn) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);
                                break;
                            } else {
                                break;
                            }

                        }
                    }
                    if (boundaries.includes(i) && position != i) {
                        break;
                    }

                }
            }

            function move_diagonally_backward_left() {
                for (i = position; i > 0; i -= 7) {

                    if (i < position) {
                        if (boxes[i] != undefined) {
                            if (boxes[i].children.length == 0) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);

                            } else if (boxes[i].getAttribute('data-color') != turn) {
                                suggestion_array.push({ original_position: position, move_to: i, character_type: character_type, side: side });
                                danger_zone.push(i);
                                break;
                            } else {
                                break;
                            }

                        }
                    }
                    if (boundaries.includes(i) && position != i) {
                        break;
                    }

                }
            }
        }
        // Ende Bishop Routine


        // Queen Routine
        function move_queen() {
            remove_suggestion();
            move_rook();
            move_bishop()
        }
        // End Queen Routine

        function move_king(king_position) {
            remove_suggestion();

            let safe_zone = JSON.parse(localStorage.getItem('safe_zone')).zones;
            let danger_zone = JSON.parse(localStorage.getItem('check_play')).plays;
            safe_zone.forEach(each => {
                if (!danger_zone.includes(each)) {
                    suggestion_array.push({ original_position: position, move_to: each, character_type: character_type, side: turn });
                }

            })
            
            // Sort Suggestion Box
            suggestion_array.sort((a, b) => {
                return a.move_to - b.move_to;
            })

            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < suggestion_array.length; i++) {
                if (ordered_array.includes(suggestion_array[i].move_to) == false) {
                    ordered_array.push(suggestion_array[i].move_to);
                    ordered_array2.push(suggestion_array[i]);
                }
            }

            suggestion_array = ordered_array2;
            console.log(suggestion_array);
            suggestion_array.forEach((each, index) => {
                boxes[each.move_to].classList.add('sug');
                boxes[each.move_to].setAttribute('data-content', boxes[each.original_position].innerHTML);
                boxes[each.move_to].setAttribute('data-additional', `${each.character_type}-${each.side}-${each.character_type}-${each.original_position}-${each.move_to}`)
                danger_zone.push(each.move_to);
            })

        }
    }



}

function check_king_on_check() {
  let  relative_position_to_king=[]
    boxes.forEach((each, index) => {
            let danger_zone = []
            boxes.forEach((each, index) => {
                let side = each.getAttribute('data-color'),
                    position = index,
                    character_type = each.getAttribute('data-character'),
                    isLeft = [0, 8, 16, 24, 32, 40, 48, 56].includes(index),
                    isRight = [7, 15, 23, 31, 39, 47, 55, 63].includes(index),
                    first_pawn_positon_black = [49, 50, 51, 52, 53, 54, 55].includes(index),
                    first_pawn_positon_white = [8, 9, 10, 11, 12, 13, 14, 15].includes(index),
                    black_pawn_at_opposite_end = [8, 9, 10, 11, 12, 13, 14, 15].includes(index),
                    white_pawn_at_opposite_end = [48, 49, 50, 51, 52, 53, 54, 55].includes(index),
                    black_pawn_resurect = [0, 1, 2, 3, 4, 5, 6, 7].includes(index),
                    knight_a_box_toleft = [1, 9, 17, 25, 33, 41, 49, 57].includes(index),
                    knight_a_box_toright = [6, 14, 22, 30, 38, 46, 54, 62].includes(index),
                    atBottom = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56].includes(index),
                    boundaries = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56, 0, 8, 16, 24, 32, 40, 48, 56,
                        7, 15, 23, 31, 39, 47, 55, 63
                    ]
                    character_moves=[];
                if (each.children.length != 0 && each.getAttribute('data-color') != turn) {
                    if (character_type == 'pawn') {
                        character_moves=[];
                        if (isLeft && side == 'black') {
                            // Double step
                            if (boxes[position - 7].getAttribute("data-color") != side || boxes[position - 7].children.length == 0) {
                                danger_zone.push(position - 7);
                                character_moves.push(position - 7);
                            }


                        } else if (isLeft && side == 'white') {

                            if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                danger_zone.push(position + 9);
                                character_moves.push(position + 9);
                            }

                            // Pawn at the right of the board
                        } else if (isRight && side == 'black') {

                            if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                danger_zone.push(position - 9);
                                character_moves.push(position - 9);
                            }
                        } else if (isRight && side == 'white') {
                            if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                danger_zone.push(position + 7);
                                character_moves.push(position + 7);
                            }
                        } else if (!isLeft && !isRight) {

                            if (side == 'black') {
                                if (boxes[position - 9] != undefined) {
                                    if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                        danger_zone.push(position - 9);
                                        character_moves.push(position - 9);
                                    }
                                }

                                if (boxes[position - 7] != undefined) {
                                    if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute("data-color") != side) {
                                        danger_zone.push(position - 7);
                                        character_moves.push(position - 7);
                                    }
                                }

                            }
                            if (side == 'white') {
                                // Double step

                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }

                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }

                            }

                        } else if (black_pawn_at_opposite_end && side == 'black') {
                            if (isRight && boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute('data-color') != side) {
                                danger_zone.push(position - 9);
                                character_moves.push(position - 9);
                            }

                            if (isLeft && boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute('data-color') != side) {
                                danger_zone.push(position - 7);
                                character_moves.push(position - 7);
                            }
                            if (!isLeft && !isRight) {
                                if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute('data-color') != side) {
                                    danger_zone.push(position - 9);
                                    character_moves.push(position - 9);
                                }

                                if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute('data-color') != side) {
                                    danger_zone.push(position - 7);
                                    character_moves.push(position - 7);
                                }
                            }
                        } else if (white_pawn_at_opposite_end && side == 'white') {
                            if (isRight && boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute('data-color') != side) {
                                danger_zone.push(position + 7);
                                character_moves.push(position + 7);
                            }

                            if (isLeft && boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute('data-color') != side) {
                                danger_zone.push(position + 9);
                                character_moves.push(position + 9);
                            }
                            if (!isLeft && !isRight) {
                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute('data-color') != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }

                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute('data-color') != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }
                            }
                        }
                        relative_position_to_king.push({character:"pawn",position:position,moves:character_moves})

                    } else if (character_type == 'knight') {
                        // Emptys the character array for each character
                        character_moves=[];
                        if (!isLeft && !isRight && !knight_a_box_toleft && !knight_a_box_toright) {
                            if (boxes[position + 17] != undefined) {
                                if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                    danger_zone.push(position + 17);
                                    character_moves.push(position + 17);
                                }
                            }
                            if (boxes[position + 15] != undefined) {
                                if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                    danger_zone.push(position + 15);
                                    character_moves.push(position + 15);
                                }
                            }
                            if (boxes[position + 6] != undefined) {
                                if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != side || boxes[position + 6].children.length == 0) {
                                    danger_zone.push(position + 6);
                                    character_moves.push(position + 6);
                                }
                            }
                            if (boxes[position + 10] != undefined) {
                                if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != side || boxes[position + 10].children.length == 0) {
                                    danger_zone.push(position + 10);
                                    character_moves.push(position + 10);
                                }
                            }
                            if (boxes[position - 17] != undefined) {
                                if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                    danger_zone.push(position - 17);
                                    character_moves.push(position - 17);
                                }
                            }
                            if (boxes[position - 15] != undefined) {
                                if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                    danger_zone.push(position - 15);
                                    character_moves.push(position - 15);
                                }
                            }
                            if (boxes[position - 6] != undefined) {
                                if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != side || boxes[position - 6].children.length == 0) {
                                    danger_zone.push(position - 6);
                                    character_moves.push(position - 6);
                                }
                            }
                            if (boxes[position - 10] != undefined) {
                                if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != side || boxes[position - 10].children.length == 0) {
                                    danger_zone.push(position - 10);
                                    character_moves.push(position - 10);
                                }
                            }
                        } else if (knight_a_box_toleft) {
                            if (boxes[position - 17] != undefined) {
                                if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                    danger_zone.push(position - 17);
                                    character_moves.push(position - 17);
                                }
                            }
                            if (boxes[position - 15] != undefined) {
                                if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                    danger_zone.push(position - 15);
                                    character_moves.push(position - 15);
                                }
                            }
                            if (boxes[position - 6] != undefined) {
                                if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != side || boxes[position - 6].children.length == 0) {
                                    danger_zone.push(position - 6);
                                    character_moves.push(position - 6);
                                }
                            }
                            if (boxes[position + 17] != undefined) {
                                if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                    danger_zone.push(position + 17);
                                    character_moves.push(position + 17);
                                }
                            }
                            if (boxes[position + 15] != undefined) {
                                if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                    danger_zone.push(position + 15);
                                    character_moves.push(position + 15);
                                }
                            }

                            if (boxes[position + 10] != undefined) {
                                if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != side || boxes[position + 10].children.length == 0) {
                                    danger_zone.push(position + 10);
                                    character_moves.push(position + 10);
                                }
                            }


                        } else if (knight_a_box_toright) {
                            if (!atBottom) {
                                if (boxes[position - 17] != undefined) {
                                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                        danger_zone.push(position - 17);
                                        character_moves.push(position - 17);
                                    }
                                }
                                if (boxes[position - 15] != undefined) {
                                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                        danger_zone.push(position - 15);
                                        character_moves.push(position - 15);
                                    }
                                }
                                if (boxes[position - 10] != undefined) {
                                    if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != side || boxes[position - 10].children.length == 0) {
                                        danger_zone.push(position - 10);
                                        character_moves.push(position - 10);
                                    }
                                }
                                if (boxes[position + 17] != undefined) {
                                    if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                        danger_zone.push(position + 17);
                                        character_moves.push(position + 17);
                                    }
                                }
                                if (boxes[position + 15] != undefined) {
                                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                        danger_zone.push(position + 15);
                                        character_moves.push(position + 15);
                                    }
                                }
                                if (boxes[position + 6] != undefined) {
                                    if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != side || boxes[position + 6].children.length == 0) {
                                        danger_zone.push(position + 6);
                                        character_moves.push(position + 6);
                                    }
                                }

                            }

                            if (atBottom) {
                                if (boxes[position + 17] != undefined) {
                                    if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                        danger_zone.push(position + 17);
                                        character_moves.push(position + 17);
                                    }
                                }
                                if (boxes[position + 15] != undefined) {
                                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                        danger_zone.push(position + 15);
                                        character_moves.push(position + 15);
                                    }
                                }
                                if (boxes[position + 6] != undefined) {
                                    if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != side || boxes[position + 6].children.length == 0) {
                                        danger_zone.push(position + 6);
                                        character_moves.push(position + 6);
                                    }
                                }
                                if (boxes[position - 17] != undefined) {
                                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                        danger_zone.push(position - 17);
                                        character_moves.push(position - 17);
                                    }
                                }
                                if (boxes[position - 15] != undefined) {
                                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                        danger_zone.push(position - 15);
                                        character_moves.push(position - 15);
                                    }
                                }
                                if (boxes[position - 6] != undefined) {
                                    if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != side || boxes[position - 6].children.length == 0) {
                                        danger_zone.push(position - 6);
                                        character_moves.push(position - 6);
                                    }
                                }
                            }
                        } else if (isLeft) {
                            if (!atBottom) {
                                if (boxes[position + 17] != undefined) {
                                    if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                        danger_zone.push(position + 17);
                                        character_moves.push(position + 17);
                                    }
                                }
                                if (boxes[position - 15] != undefined) {
                                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                        danger_zone.push(position - 15);
                                        character_moves.push(position - 15);
                                    }
                                }
                                if (boxes[position + 10] != undefined) {
                                    if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != side || boxes[position + 10].children.length == 0) {
                                        danger_zone.push(position + 10);
                                        character_moves.push(position + 10);
                                    }
                                }
                                if (boxes[position - 6] != undefined) {
                                    if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != side || boxes[position - 6].children.length == 0) {
                                        danger_zone.push(position - 6);
                                        character_moves.push(position - 6);
                                    }
                                }
                            } else {
                                if (boxes[position - 15] != undefined) {
                                    if (boxes[position - 15].getAttribute('data-color') != undefined && boxes[position - 15].getAttribute('data-color') != side || boxes[position - 15].children.length == 0) {
                                        danger_zone.push(position - 15);
                                        character_moves.push(position - 15);
                                    }
                                }
                                if (boxes[position - 6] != undefined) {
                                    if (boxes[position - 6].getAttribute('data-color') != undefined && boxes[position - 6].getAttribute('data-color') != side || boxes[position - 6].children.length == 0) {
                                        danger_zone.push(position - 6);
                                        character_moves.push(position - 6);
                                    }
                                }
                                if (side == 'white') {
                                    if (boxes[position + 10] != undefined) {
                                        if (boxes[position + 10].getAttribute('data-color') != undefined && boxes[position + 10].getAttribute('data-color') != side || boxes[position + 10].children.length == 0) {

                                            danger_zone.push(position + 10);
                                            character_moves.push(position + 10);
                                        }
                                    }
                                    if (boxes[position + 17] != undefined) {
                                        if (boxes[position + 17].getAttribute('data-color') != undefined && boxes[position + 17].getAttribute('data-color') != side || boxes[position + 17].children.length == 0) {
                                            danger_zone.push(position + 17);
                                            character_moves.push(position + 17);
                                        }
                                    }
                                }
                            }
                        } else if (isRight) {
                            if (atBottom) {
                                if (boxes[position - 17] != undefined) {
                                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                        danger_zone.push(position - 17);
                                        character_moves.push(position - 17);
                                    }
                                }
                                if (boxes[position - 10] != undefined) {
                                    if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != side || boxes[position - 10].children.length == 0) {
                                        danger_zone.push(position - 10);
                                        character_moves.push(position - 10);
                                    }
                                }

                                if (boxes[position + 6] != undefined) {
                                    if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != side || boxes[position + 6].children.length == 0) {
                                        danger_zone.push(position + 6);
                                        character_moves.push(position + 6);
                                    }
                                }
                                if (boxes[position + 15] != undefined) {
                                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                        danger_zone.push(position + 15);
                                        character_moves.push(position + 15);
                                    }
                                }

                            } else {
                                if (boxes[position - 17] != undefined) {
                                    if (boxes[position - 17].getAttribute('data-color') != undefined && boxes[position - 17].getAttribute('data-color') != side || boxes[position - 17].children.length == 0) {
                                        danger_zone.push(position - 17);
                                        character_moves.push(position - 17);
                                    }
                                }
                                if (boxes[position + 15] != undefined) {
                                    if (boxes[position + 15].getAttribute('data-color') != undefined && boxes[position + 15].getAttribute('data-color') != side || boxes[position + 15].children.length == 0) {
                                        danger_zone.push(position + 15);
                                        character_moves.push(position + 15);
                                    }
                                }
                                if (boxes[position - 10] != undefined) {
                                    if (boxes[position - 10].getAttribute('data-color') != undefined && boxes[position - 10].getAttribute('data-color') != side || boxes[position - 10].children.length == 0) {
                                        danger_zone.push(position - 10);
                                        character_moves.push(position - 10);
                                    }
                                }

                                if (boxes[position + 6] != undefined) {
                                    if (boxes[position + 6].getAttribute('data-color') != undefined && boxes[position + 6].getAttribute('data-color') != side || boxes[position + 6].children.length == 0) {
                                        danger_zone.push(position + 6);
                                        character_moves.push(position + 6);
                                    }
                                }
                            }
                        }
                        relative_position_to_king.push({character:"knight",position:position,moves:character_moves})
                    } else if (character_type == 'bishop') {
                        character_moves=[];
                        let boundaries = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56, 0, 8, 16, 24, 32, 40, 48, 56,
                                7, 15, 23, 31, 39, 47, 55, 63
                            ],
                            bottom_pos = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56];
                        for (i = position; i <= position * 8; i += 7) {
                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        
                                        // To emsure that the loop doesn't break if the obstructing piece is not a king
                                        // so as to capture the empty boxes on the line as a danger zone

                                        if (boxes[i].getAttribute('data-character') != 'king') break;
            
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        for (i = position; i < 64; i += 9) {

                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        for (i = position; i > 0; i -= 9) {

                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }

                        }
                        for (i = position; i > 0; i -= 7) {

                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }

                        }
                        relative_position_to_king.push({character:"bishop",position:position,moves:character_moves})
                    } else if (character_type == 'rook') {
                        //    Move vertically Upward
                        for (i = position; i < 64; i += 8) {
                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0 ) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i)
                                        character_moves.push(i)
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        //    Move vertically Downward
                        for (i = position; i >= i - (Math.floor(i / 8) * 8); i -= 8) {
                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }

                        //    Move Horizontally Forward
                        for (i = position; i <= (8 * Math.floor(position / 8)) + 7; i++) {

                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        //    Move Horizontally Backward
                        for (i = position; i >= 8 * Math.floor(position / 8); i--) {

                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }


                                }
                                if (boundaries.includes(i) && position != i) {
                                    break;
                                }
                            }
                        }

                        relative_position_to_king.push({character:"rook",position:position,moves:character_moves})
                    } else if (character_type == 'queen') {
                        character_moves=[]
                        let boundaries = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56, 0, 8, 16, 24, 32, 40, 48, 56,
                                7, 15, 23, 31, 39, 47, 55, 63
                            ],
                            bottom_pos = [0, 1, 2, 3, 4, 5, 6, 7, 63, 62, 61, 60, 59, 58, 57, 56];
                        for (i = position; i <= position * 8; i += 7) {
                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        for (i = position; i < 64; i += 9) {

                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        for (i = position; i > 0; i -= 9) {

                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }

                        }
                        for (i = position; i > 0; i -= 7) {
                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }

                        }
                        //    Move vertically Upward
                        for (i = position; i < 64; i += 8) {
                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i)
                                        character_moves.push(i)
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        //    Move vertically Downward
                        for (i = position; i >= i - (Math.floor(i / 8) * 8); i -= 8) {
                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }

                        //    Move Horizontally Forward
                        for (i = position; i <= (8 * Math.floor(position / 8)) + 7; i++) {

                            if (i > position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }

                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        //    Move Horizontally Backward
                        for (i = position; i >= 8 * Math.floor(position / 8); i--) {

                            if (i < position) {
                                if (boxes[i] != undefined) {
                                    if (boxes[i].children.length == 0) {
                                        danger_zone.push(i);
                                        character_moves.push(i);

                                    } else if (boxes[i].getAttribute('data-color') != side) {
                                        danger_zone.push(i);
                                        character_moves.push(i);
                                        if (boxes[i].getAttribute('data-character') != 'king') break;
                                    } else {
                                        break;
                                    }


                                }
                            }
                            if (boundaries.includes(i) && position != i) {
                                break;
                            }
                        }
                        relative_position_to_king.push({character:"queen",position:position,moves:character_moves})
                    }else if(character_type == 'king'){
                         character_moves=[];
                        /*       
                          in this routine pawn's logic will be mostly used  
                          because the kings moves almost like a pawn
                        */
                        if (isLeft && side == 'black') {
                            // Double step
                            if (boxes[position - 7].getAttribute("data-color") != side || boxes[position - 7].children.length == 0) {
                                danger_zone.push(position - 7);
                                character_moves.push(position - 7);
                            }


                        } else if (isLeft && side == 'white') {

                            if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                danger_zone.push(position + 9);
                                character_moves.push(position + 9);
                            }

                            // Pawn at the right of the board
                        } else if (isRight && side == 'black') {

                            if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                danger_zone.push(position - 9);
                                character_moves.push(position - 9);
                            }
                        } else if (isRight && side == 'white') {
                            if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                danger_zone.push(position + 7);
                                character_moves.push(position + 7);
                            }
                        } else if (!isLeft && !isRight) {

                            if (side == 'black') {
                                if (boxes[position - 9] != undefined) {
                                    if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                        danger_zone.push(position - 9);
                                        character_moves.push(position - 9);
                                    }
                                }

                                if (boxes[position - 7] != undefined) {
                                    if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute("data-color") != side) {
                                        danger_zone.push(position - 7);
                                        character_moves.push(position - 7);
                                    }
                                }

                            }
                            if (side == 'white') {
                                // Double step

                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }

                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }

                            }

                        } else if (black_pawn_at_opposite_end && side == 'black') {
                            if (isRight && boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute('data-color') != side) {
                                danger_zone.push(position - 9);
                                character_moves.push(position - 9);
                            }

                            if (isLeft && boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute('data-color') != side) {
                                danger_zone.push(position - 7);
                                character_moves.push(position - 7);
                            }
                            if (!isLeft && !isRight) {
                                if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute('data-color') != side) {
                                    danger_zone.push(position - 9);
                                    character_moves.push(position - 9);
                                }

                                if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute('data-color') != side) {
                                    danger_zone.push(position - 7);
                                    character_moves.push(position - 7);
                                }
                            }
                        } else if (white_pawn_at_opposite_end && side == 'white') {
                            if (isRight && boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute('data-color') != side) {
                                danger_zone.push(position + 7);
                                character_moves.push(position + 7);
                            }

                            if (isLeft && boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute('data-color') != side) {
                                danger_zone.push(position + 9);
                                character_moves.push(position + 9);
                            }
                            if (!isLeft && !isRight) {
                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute('data-color') != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }

                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute('data-color') != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }
                            }
                        }
                        // King's own movement
                        else if(!isLeft && isRight){

                            if (boxes[position - 9] != undefined) {
                                if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 9);
                                    character_moves.push(position - 9);
                                }
                            }

                            if (boxes[position - 7] != undefined) {
                                if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 7);
                                    character_moves.push(position - 7);
                                }
                            }
                            if (boxes[position - 8] != undefined) {
                                if (boxes[position - 8].children.length == 0 || boxes[position - 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 8);
                                    character_moves.push(position - 8);
                                }
                            }
                            if (boxes[position + 9] != undefined) {
                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }
                            }

                            if (boxes[position + 7] != undefined) {
                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }
                            }
                            if (boxes[position + 8] != undefined) {
                                if (boxes[position + 8].children.length == 0 || boxes[position + 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 8);
                                    character_moves.push(position + 8);
                                }
                            }
                            if (boxes[position - 1] != undefined) {
                                if (boxes[position - 1].children.length == 0 || boxes[position - 1].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 1);
                                    character_moves.push(position - 1);
                                }
                            }
                            if (boxes[position + 1] != undefined) {
                                if (boxes[position + 1].children.length == 0 || boxes[position + 1].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 1);
                                    character_moves.push(position + 1);
                                }
                            }

                        }
                        else if(isRight){
                           if(boxes[position - 9] != undefined) {
                                if (boxes[position - 9].children.length == 0 || boxes[position - 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 9);
                                    character_moves.push(position - 9);
                                }
                           }
                        
                            if(boxes[position + 7] != undefined) {
                                if (boxes[position + 7].children.length == 0 || boxes[position + 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 7);
                                    character_moves.push(position + 7);
                                }
                            }
                            if (boxes[position - 1] != undefined) {
                                if (boxes[position - 1].children.length == 0 || boxes[position - 1].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 1);
                                    character_moves.push(position - 1);
                                }
                            }
                            if (boxes[position - 8] != undefined) {
                                if (boxes[position - 8].children.length == 0 || boxes[position - 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 8);
                                    character_moves.push(position - 8);
                                }
                            }
                            if (boxes[position + 8] != undefined) {
                                if (boxes[position + 8].children.length == 0 || boxes[position + 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 8);
                                    character_moves.push(position + 8);
                                }
                            }

                                
                        }
                        else if(isLeft){
                           if(boxes[position - 7] != undefined) {
                                if (boxes[position - 7].children.length == 0 || boxes[position - 7].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 7);
                                    character_moves.push(position - 7);
                                }
                           }
                        
                            if(boxes[position + 9] != undefined) {
                                if (boxes[position + 9].children.length == 0 || boxes[position + 9].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 9);
                                    character_moves.push(position + 9);
                                }
                            }
                            if (boxes[position + 1] != undefined) {
                                if (boxes[position + 1].children.length == 0 || boxes[position + 1].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 1);
                                    character_moves.push(position + 1);
                                }
                            }
                            if (boxes[position - 8] != undefined) {
                                if (boxes[position - 8].children.length == 0 || boxes[position - 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position - 8);
                                    character_moves.push(position - 8);
                                }
                            }
                            if (boxes[position + 8] != undefined) {
                                if (boxes[position + 8].children.length == 0 || boxes[position + 8].getAttribute("data-color") != side) {
                                    danger_zone.push(position + 8);
                                    character_moves.push(position + 8);
                                }
                            }

                                
                        }
                        relative_position_to_king.push({character:"king",position:position,moves:character_moves})

                    }
                }
                
              

            })
            


            //   Sort Suggestion Box
            danger_zone.sort((a, b) => {
                return a - b;
            })

            let ordered_array = [],
                ordered_array2 = [];
            for (i = 0; i < danger_zone.length; i++) {
                if (ordered_array.includes(danger_zone[i]) == false) {
                    ordered_array.push(danger_zone[i]);
                    ordered_array2.push(danger_zone[i]);
                }
            }
            danger_zone = ordered_array2
            localStorage.setItem('check_play', JSON.stringify({ plays: danger_zone }));

              //   Sort relative_positions
            

            
            for (i = 0; i < relative_position_to_king.length; i++) {
                if (ordered_array.includes(relative_position_to_king[i]) == false) {
                    ordered_array.push(relative_position_to_king[i]);
                    ordered_array2.push(relative_position_to_king[i]);
                }
            }
            relative_position_to_king = ordered_array2

           
        })
   
        // Check if King is in danger zone
    let danger_zone = JSON.parse(localStorage.getItem('check_play')).plays
    let safe_zone = [];

    // Get suggestion for king if  on check
    for (each = 0; each < danger_zone.length; each++) {
        let isLeft = [0, 8, 16, 24, 32, 40, 48, 56].includes(each),
            isRight = [7, 15, 23, 31, 39, 47, 55, 63].includes(each);
        if (boxes[each].getAttribute('data-character') == 'king' && boxes[each].getAttribute('data-color') == turn) {

            // Check if it's a checkmate
            if (!isLeft && !isRight) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                    }

                }
                if (boxes[each + 9] != undefined) {
                    if (boxes[each + 9].children.length == 0 || boxes[each + 9].getAttribute('data-color') != undefined && boxes[each + 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 9)
                    }

                }
                if (boxes[each + 7] != undefined) {
                    if (boxes[each + 7].children.length == 0 || boxes[each + 7].getAttribute('data-color') != undefined && boxes[each + 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 7)
                    }

                }
                if (boxes[each + 1] != undefined) {
                    if (boxes[each + 1].children.length == 0 || boxes[each + 1].getAttribute('data-color') != undefined && boxes[each + 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 1)
                    }

                }
                if (boxes[each - 1] != undefined) {
                    if (boxes[each - 1].children.length == 0 || boxes[each - 1].getAttribute('data-color') != undefined && boxes[each - 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 1)
                    }

                }
                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                    }

                }
                if (boxes[each - 7] != undefined) {
                    if (boxes[each - 7].children.length == 0 || boxes[each - 7].getAttribute('data-color') != undefined && boxes[each - 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 7)
                    }

                }
                if (boxes[each - 9] != undefined) {
                    if (boxes[each - 9].children.length == 0 || boxes[each - 9].getAttribute('data-color') != undefined && boxes[each - 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 9)
                    }

                }
            }
            if (isLeft) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                    }

                }
                if (boxes[each + 9] != undefined) {
                    if (boxes[each + 9].children.length == 0 || boxes[each + 9].getAttribute('data-color') != undefined && boxes[each + 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 9)
                    }

                }
                if (boxes[each + 1] != undefined) {
                    if (boxes[each + 1].children.length == 0 || boxes[each + 1].getAttribute('data-color') != undefined && boxes[each + 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 1)
                    }

                }

                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                    }

                }
                if (boxes[each - 7] != undefined) {
                    if (boxes[each - 7].children.length == 0 || boxes[each - 7].getAttribute('data-color') != undefined && boxes[each - 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 7)
                    }

                }
            }
            if (isRight) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                    }

                }

                if (boxes[each - 1] != undefined) {
                    if (boxes[each - 1].children.length == 0 || boxes[each - 1].getAttribute('data-color') != undefined && boxes[each - 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 1)
                    }

                }
                if (boxes[each + 7] != undefined) {
                    if (boxes[each + 7].children.length == 0 || boxes[each + 7].getAttribute('data-color') != undefined && boxes[each + 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 7)
                    }

                }
                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                    }

                }
                if (boxes[each - 9] != undefined) {
                    if (boxes[each - 9].children.length == 0 || boxes[each - 9].getAttribute('data-color') != undefined && boxes[each - 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 9)
                    }

                }
            }


            break;

        } else {
            localStorage.setItem('king_on_check', [false, turn]);

        }



    }
    // Get suggestion for king if not on check
    boxes.forEach((box, each) => {
        let isLeft = [0, 8, 16, 24, 32, 40, 48, 56].includes(each),
            isRight = [7, 15, 23, 31, 39, 47, 55, 63].includes(each);
        if (boxes[each].getAttribute('data-character') == 'king' && boxes[each].getAttribute('data-color') == turn) {
            if (!isLeft && !isRight) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                        danger_zone.push(each + 8)
                    }

                }
                if (boxes[each + 9] != undefined) {
                    if (boxes[each + 9].children.length == 0 || boxes[each + 9].getAttribute('data-color') != undefined && boxes[each + 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 9)
                        danger_zone.push(each + 9)
                    }

                }
                if (boxes[each + 7] != undefined) {
                    if (boxes[each + 7].children.length == 0 || boxes[each + 7].getAttribute('data-color') != undefined && boxes[each + 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 7)
                        danger_zone.push(each + 7)
                    }

                }
                if (boxes[each + 1] != undefined) {
                    if (boxes[each + 1].children.length == 0 || boxes[each + 1].getAttribute('data-color') != undefined && boxes[each + 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 1)
                        danger_zone.push(each + 1)
                    }

                }
                if (boxes[each - 1] != undefined) {
                    if (boxes[each - 1].children.length == 0 || boxes[each - 1].getAttribute('data-color') != undefined && boxes[each - 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 1)
                        danger_zone.push(each - 1)
                    }

                }
                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                        danger_zone.push(each - 8)
                    }

                }
                if (boxes[each - 7] != undefined) {
                    if (boxes[each - 7].children.length == 0 || boxes[each - 7].getAttribute('data-color') != undefined && boxes[each - 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 7)
                        danger_zone.push(each - 7)
                    }

                }
                if (boxes[each - 9] != undefined) {
                    if (boxes[each - 9].children.length == 0 || boxes[each - 9].getAttribute('data-color') != undefined && boxes[each - 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 9)
                        danger_zone.push(each - 9)
                    }

                }
            }
            if (isLeft) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                        danger_zone.push(each + 8)
                    }

                }
                if (boxes[each + 9] != undefined) {
                    if (boxes[each + 9].children.length == 0 || boxes[each + 9].getAttribute('data-color') != undefined && boxes[each + 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 9)
                        danger_zone.push(each + 9)
                    }

                }
                if (boxes[each + 1] != undefined) {
                    if (boxes[each + 1].children.length == 0 || boxes[each + 1].getAttribute('data-color') != undefined && boxes[each + 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 1)
                        danger_zone.push(each + 1)
                    }

                }

                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                        danger_zone.push(each - 8)
                    }

                }
                if (boxes[each - 7] != undefined) {
                    if (boxes[each - 7].children.length == 0 || boxes[each - 7].getAttribute('data-color') != undefined && boxes[each - 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 7)
                        danger_zone.push(each - 7)
                    }

                }
            }
            if (isRight) {
                if (boxes[each + 8] != undefined) {
                    if (boxes[each + 8].children.length == 0 || boxes[each + 8].getAttribute('data-color') != undefined && boxes[each + 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 8)
                        danger_zone.push(each + 8)
                    }

                }

                if (boxes[each - 1] != undefined) {
                    if (boxes[each - 1].children.length == 0 || boxes[each - 1].getAttribute('data-color') != undefined && boxes[each - 1].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 1)
                        danger_zone.push(each - 1)
                    }

                }
                if (boxes[each + 7] != undefined) {
                    if (boxes[each + 7].children.length == 0 || boxes[each + 7].getAttribute('data-color') != undefined && boxes[each + 7].getAttribute('data-color') != turn) {
                        safe_zone.push(each + 7)
                        danger_zone.push(each + 7)
                    }

                }
                if (boxes[each - 8] != undefined) {
                    if (boxes[each - 8].children.length == 0 || boxes[each - 8].getAttribute('data-color') != undefined && boxes[each - 8].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 8)
                        danger_zone.push(each - 8)
                    }

                }
                if (boxes[each - 9] != undefined) {
                    if (boxes[each - 9].children.length == 0 || boxes[each - 9].getAttribute('data-color') != undefined && boxes[each - 9].getAttribute('data-color') != turn) {
                        safe_zone.push(each - 9)
                        danger_zone.push(each - 9)
                    }

                }
            }


        }



    })
    
    localStorage.setItem('safe_zone', JSON.stringify({ zones: safe_zone }));
    localStorage.setItem('relative_positions', JSON.stringify({ position: relative_position_to_king }));
    console.log(danger_zone.includes(parseInt(king_position)));
    return  danger_zone.includes(parseInt(king_position)) ? true : false;
}

function mandate_check() {
    if(check_king_on_check(king_position) ){
        alert('check');
        king_on_check=true;
        boxes[king_position].style.backgroundColor='red';
    } 
}
function get_check_pattern(){
    function __sort_relative_positions_to_king(){
        let relative_position_to_king=JSON.parse(localStorage.getItem('relative_positions')).position;
        let ordered_array = [],
        ordered_array2 = [],
        counter=0;
        relative_position_to_king =relative_position_to_king.filter((each,index)=> index < 70 ).filter((each)=>isNaN(each))
        let starting_point= relative_position_to_king[0].position;
        for (i = 0; i < relative_position_to_king.length; i++) {
            if(counter < 2){
                ordered_array.push(relative_position_to_king[i])
                if(relative_position_to_king[i].position==starting_point){
                    counter++;
                    console.log(counter)
                }
            }
        }
        return ordered_array;
    }
  let  relative_position_to_king = __sort_relative_positions_to_king();
  let _patterns=[]
    // To remove the last unwanted element
    relative_position_to_king.pop();
    
    let checking_character = king_on_check ? relative_position_to_king.find((each)=>each.moves.includes(king_position)) : null;
    console.log(checking_character);
    if(king_on_check){
        switch(checking_character.character){
            case "bishop": 
              _patterns = _bishop_pattern();
            break;
            case  "rook":
            _patterns =   _rook_pattern();
            break;
            case  "queen":
            _patterns=_queen_pattern();
            break;
            case  "pawn":
            _patterns=_pawn_pattern();
            break;
            case  "knight":
            _patterns=_knight_pattern();
            break;
        }
    }

    function _bishop_pattern(){
        const _patterns =[]
        // If the king is ahead of the bishop
        if(king_position < checking_character.position){
            //  if the diagonals are to the right 
            if((checking_character.position - king_position) % 7 == 0 )  {
                const _boxes_in_between=((checking_character.position - king_position) / 7) - 1;
                for(i=1;i<=_boxes_in_between;i++){
                    _patterns.push(king_position + (i*7) )
                }
                
            }
             //  if the diagonals are to the left
            else if((checking_character.position - king_position) % 9 == 0 ){
                const _boxes_in_between=((checking_character.position - king_position) / 9) - 1;
                for(i=1;i<= _boxes_in_between;i++){
                    _patterns.push(king_position + (i*9))
                }
            }
        }
        // King is behind the bishop
        else if(king_position > checking_character.position){
            if((king_position-checking_character.position) % 7 == 0 )  {
                const _boxes_in_between=(( king_position  - checking_character.position) / 7) - 1;
                for(i=1;i<=_boxes_in_between;i++){
                    _patterns.push(king_position - (i*7))
                }
                
            }
            if((king_position-checking_character.position) % 9 == 0 )  {
                const _boxes_in_between=(( king_position  - checking_character.position) / 9) - 1;
                for(i=1;i<=_boxes_in_between;i++){
                    _patterns.push(king_position - (i*9))
                }
                
            }
        }
        return [..._patterns.filter((each)=>checking_character.moves.includes(each)),checking_character.position];
    }

    function _rook_pattern(){
        const _patterns=[]
      
         // Rook on vertical axis to king
        if(checking_character.position > king_position){
              const _boxes_in_between=((  checking_character.position - king_position  ) / 8) - 1;
              if((checking_character.position- king_position) >= 8){
                for(i=1;i<=_boxes_in_between;i++){
                    _patterns.push(king_position + (i*8))
                }  
              }
        }else{
            const _boxes_in_between=(( king_position  - checking_character.position) / 8) - 1;
            if((king_position-checking_character.position) >= 8){
              for(i=1;i<=_boxes_in_between;i++){
                  _patterns.push(king_position - (i*8));
              }  
            }
        }

        // Rook on the horizontal axis to king
        if (checking_character.position > king_position) {
            const _boxes_in_between = ((checking_character.position - king_position)) - 1;
            if ((checking_character.position - king_position) < 8) {
                for (i = 1; i <= _boxes_in_between; i++) {
                    _patterns.push(king_position + i)
                }
            }
        }
        else if (king_position > checking_character.position) {
            const _boxes_in_between = ((king_position - checking_character.position)) - 1;
            if ((king_position - checking_character.position) < 8) {
                for (i = 1; i <= _boxes_in_between; i++) {
                    _patterns.push(king_position - i);
                }
            }
        }
      return [..._patterns.filter((each)=>checking_character.moves.includes(each)),checking_character.position];

    }

    function _pawn_pattern(){
        return [checking_character.position];
    }

    function _queen_pattern(){
       return  [].concat(_rook_pattern().filter((each)=>checking_character.moves.includes(each)),_bishop_pattern().filter((each)=>checking_character.moves.includes(each)),checking_character.position);
    }
    
    function _knight_pattern(){
        return [checking_character.position];
    }
    
    return _patterns;
    
}




gameplay();
mandate_check();
