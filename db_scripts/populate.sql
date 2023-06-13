# Do not change the order or names of states 
#(the code is assuming specific IDs and names)
# You can add more in the end
insert into game_state (gst_state) values ('Waiting');
insert into game_state (gst_state) values ('Started');
insert into game_state (gst_state) values ('Finished');
insert into game_state (gst_state) values ('Canceled');

# Do not change the order, but you can add more in the end
insert into user_game_state (ugst_state) values ('Waiting');
insert into user_game_state (ugst_state) values ('Playing');
insert into user_game_state (ugst_state) values ('Score');
insert into user_game_state (ugst_state) values ('End');

# Possible end game states
insert into scoreboard_state (sbs_state) values ('Tied');
insert into scoreboard_state (sbs_state) values ('Lost');
insert into scoreboard_state (sbs_state) values ('Won');

# --------------- NEW ---------------

insert user values 	(1, 'player1', '$2b$10$Wemfac2wY/7RSCdKxuYUL.GV2clfhXC66OL76uCpDFUmpYZ/bGZtW', '48MnTVJ6sKIvanVHbP5Vx5rysbYrVN4EbYmk4D8xESdfm1hx8jDfNFZGNw9OZs'),
					(2, 'player2', '$2b$10$6j2xIDnnxv.TLfBSstbbO.qE7wFTf5envx/uijiFjCP3slsy7EE4K', 'dQ7NrsbPsuF81xFGNioR1K0tiYkjtxOhemcgMhuFIS68VrFUC9gggm3JCgzkqe');

insert into game values (1, 1, 2);

insert into user_game values (1, 1, 1, 1, 2, 10, 1);
insert into user_game values (2, 2, 2, 1, 1, 10, 1);

insert into card_type (ct_name) values ('Construction');
insert into card_type (ct_name) values ('Demolition');
insert into card_type (ct_name) values ('Utility');

insert into tower_state (tst_name) values ("Ready");
insert into tower_state (tst_name) values ("Acted");
insert into tower_state (tst_name) values ("Protected");


insert into card (crd_cost, crd_name, crd_effect, crd_type_id) values
   (1, "Ball!", "Wrecks 1 Level", 2),
   (2, "Boom!", "Wrecks 2 levels", 2),
   (3, "Adieu", "Wrecks 50% of the tower", 2),
   
   (1, "Bob", "Builds 1 level", 1),
   (2, "Plans!", "Builds 2 levels", 1),
   (3, "Crane!", "Builds 50% of current levels", 1),
   
   (2, "Hat!", "Safe for a turn", 3),
   (3, "Yoink", "Opponent tools -1", 3),
   (2, "Noink", "Player tools +1", 3);