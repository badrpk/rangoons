from core.main import HuobzLang

def test_define():
    lang = HuobzLang()
    lang.define("key", "value")
    assert lang.variables["key"] == "value"

def test_execute_say():
    lang = HuobzLang()
    lang.execute("say", "Hello!")
