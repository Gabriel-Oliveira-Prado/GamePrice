using GamePrice.Api.Domain.DTOs;
using System.Collections.Generic;

namespace GamePrice.Models
{
    public class HomeViewModel
    {
        public List<GameDealDto> Deals { get; set; } = new();
        public List<GameDealDto> FreeGames { get; set; } = new();
    }
}
