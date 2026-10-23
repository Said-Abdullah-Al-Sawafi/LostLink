using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LostLink.Pages;

[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
[IgnoreAntiforgeryToken]
public class ErrorModel : PageModel
{
    public int Code { get; set; }
    public string Message { get; set; } = "";

    public void OnGet(int? code)
    {
        Code = code ?? 500;
        Message = Code switch
        {
            404 => "We could not find that page or item - it may have been removed.",
            403 => "You are not allowed to view this page.",
            _   => "Something went wrong on our side. Please go back and try again."
        };
    }
}
