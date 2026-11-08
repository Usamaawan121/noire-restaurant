const item = (name, category, price, photo, description) => ({
 name, category, price, image: `/photos/noire-${photo}.jpg`, description, available: true
});

export const fastFood = [
 item('NOIRÉ Double Smash','Burgers',1490,'smash','Two seared beef patties, cheddar, dill pickles and house sauce on brioche.'),
 item('Classic Smash','Burgers',1050,'smash','Smashed beef, American cheese, diced onion and mustard.'),
 item('Smoky Onion Double','Burgers',1590,'smash','Double beef, slow-cooked onions, cheddar and smoky barbecue sauce.'),
 item('Buttermilk Crispy Chicken','Burgers',1190,'crispy','Golden chicken fillet, crunchy slaw and pepper mayo.'),
 item('Firehouse Chicken Burger','Burgers',1290,'crispy','Crispy chicken, jalapeño slaw and hot honey mayo.'),
 item('Pepperoni After Dark','Pizza',1890,'pepperoni','Beef pepperoni, mozzarella and house tomato sauce on a 12-inch hand-stretched base.'),
 item('Double Pepperoni','Pizza',2190,'pepperoni','Extra beef pepperoni and mozzarella on a 12-inch base.'),
 item('Smoky BBQ Chicken Pizza','Pizza',1990,'bbq','Barbecue chicken, red onion and peppers on a 12-inch base.'),
 item('Chicken Tikka Pizza','Pizza',1990,'bbq','Tikka chicken, capsicum, red onion and mozzarella on a 12-inch base.'),
 item('Fire-Roasted Chicken Pizza','Pizza',2090,'bbq','Roasted chicken, charred peppers and chili glaze on a 12-inch base.'),
 item('Triple-Stack Chicken Club','Sandwiches',1090,'club','Three layers of toast with chicken, egg, lettuce and tomato.'),
 item('Pepper Chicken Toastie','Sandwiches',950,'club','Pepper chicken, cheddar and mustard mayo on grilled bread.'),
 item('Grilled Chicken & Cheese','Sandwiches',990,'club','Grilled chicken, melted cheese, crisp lettuce and garlic mayo.'),
 item('Southern Chicken • 2 Pieces','Fried Chicken',950,'fried','Two large bone-in fried chicken pieces with house dipping sauce.'),
 item('Southern Chicken • 3 Pieces','Fried Chicken',1290,'fried','Three large bone-in fried chicken pieces with slaw and house dip.'),
 item('Southern Chicken • 5 Pieces','Fried Chicken',1990,'fried','Five large bone-in pieces with two house dips.'),
 item('Family Chicken Bucket • 8 Pieces','Fried Chicken',3090,'fried','Eight large bone-in pieces, shareable fries and three house dips.'),
 item('Garlic Chicken Shawarma','Wraps',750,'wrap','Grilled chicken, pickles and whipped garlic sauce in toasted flatbread.'),
 item('Spicy Crunch Wrap','Wraps',890,'wrap','Crispy chicken, fresh greens and house chili mayo.'),
 item('Smoky BBQ Chicken Wrap','Wraps',920,'wrap','Smoky barbecue chicken, slaw and red onion in a toasted wrap.'),
 item('Classic Salted Fries','Fries & Sides',390,'fries','Golden fries finished with sea salt.'),
 item('Loaded Jalapeño Fries','Fries & Sides',790,'fries','Fries topped with cheese sauce, jalapeños and spring onion.'),
 item('Smoky Chicken Loaded Fries','Fries & Sides',950,'fries','Cheese fries with shredded chicken, barbecue sauce and scallions.'),
 item('Sticky BBQ Wings • 6 Pieces','Wings',890,'wings','Six chicken wings tossed in sticky smoky barbecue glaze.'),
 item('Hot Honey Wings • 6 Pieces','Wings',920,'wings','Six crisp wings in a sweet and hot chili glaze.'),
 item('Wing Box • 12 Pieces','Wings',1690,'wings','Twelve wings with barbecue and hot honey sauces.'),
 item('Double Smash Combo','Combos',1890,'smash','NOIRÉ Double Smash, salted fries and a soft drink.'),
 item('Crispy Chicken Combo','Combos',1590,'crispy','Buttermilk chicken burger, salted fries and a soft drink.'),
 item('Three-Piece Chicken Combo','Combos',1690,'fried','Three large chicken pieces, salted fries, house dip and a soft drink.'),
 item('Pizza Night for Two','Combos',2690,'pepperoni','One 12-inch Pepperoni After Dark, salted fries and two soft drinks.')
];

export const heroDishes = [0,5,14,10,3,17,21,23].map(index => fastFood[index]);
