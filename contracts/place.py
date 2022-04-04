import smartpy as sp


class PlaceContrac(sp.Contract):


    def __init__(self):
        self.init_type(sp.TRecord(
            # The big map with the pixels colors
            pixels=sp.TBigMap(sp.TNat, sp.TString),
            users_times=sp.TBigMap(sp.TAddress, sp.TTimestamp),
            ))

        # Initialize the contract storage
        self.init(
            pixels=sp.big_map(),
            users_times=sp.big_map())     

    @sp.entry_point
    def update(self, params):
        # input parameter types]
        sp.set_type(params, sp.TRecord(
            pixel=sp.TNat,
            color=sp.TString,
        ))

        with sp.if_(self.data.users_times.contains(sp.sender)):
            usertime = self.data.users_times[sp.sender].add_minutes(2)
            sp.verify(usertime<sp.now, message="TOO_SOON")
            
        
        self.data.users_times[sp.sender] = sp.now
        self.data.pixels[params.pixel] = params.color


sp.add_compilation_target("Place", PlaceContrac())

@sp.add_test(name = "Minimal")
def test():
    scenario = sp.test_scenario()
    c1 = PlaceContrac()
    scenario += c1
    alice = sp.test_account("Alice")
    """ Test views """
    current_time = sp.now
    c1.update(
        pixel = 100,
        color = "aaaaaaa"
    ).run(valid = True,sender = alice.address,now = current_time)
    c1.update(
        pixel = 101,
        color = "aaaaaaa"
    ).run(valid = False,sender = alice.address,now = current_time.add_minutes(1))
